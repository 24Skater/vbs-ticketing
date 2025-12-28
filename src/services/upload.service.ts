/**
 * File Upload Service
 * Handles image uploads for logos, hero images, etc.
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadResult {
  success: boolean;
  upload?: {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  };
  error?: string;
}

export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const PUBLIC_URL_BASE = process.env.PUBLIC_URL || '';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  const fullPath = path.resolve(UPLOAD_DIR);
  try {
    await fs.access(fullPath);
  } catch {
    await fs.mkdir(fullPath, { recursive: true });
    logger.info('Created upload directory', { path: fullPath });
  }
}

/**
 * Generate unique filename
 */
function generateFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

/**
 * Process image with sharp
 */
async function processImage(
  buffer: Buffer,
  mimetype: string,
  options: ImageOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format,
  } = options;

  // Skip processing for SVGs
  if (mimetype === 'image/svg+xml') {
    return buffer;
  }

  let processor = sharp(buffer);

  // Resize if needed
  const metadata = await processor.metadata();
  if (metadata.width && metadata.height) {
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      processor = processor.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  // Convert format if specified
  if (format) {
    switch (format) {
      case 'jpeg':
        processor = processor.jpeg({ quality });
        break;
      case 'png':
        processor = processor.png({ quality });
        break;
      case 'webp':
        processor = processor.webp({ quality });
        break;
    }
  } else {
    // Keep original format but optimize
    if (mimetype === 'image/jpeg') {
      processor = processor.jpeg({ quality });
    } else if (mimetype === 'image/png') {
      processor = processor.png({ quality });
    } else if (mimetype === 'image/webp') {
      processor = processor.webp({ quality });
    }
  }

  return processor.toBuffer();
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload a file
 */
export async function uploadFile(
  file: UploadedFile,
  options: ImageOptions = {},
  uploadedBy?: string
): Promise<UploadResult> {
  try {
    // Validate file
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return {
        success: false,
        error: `Invalid file type. Allowed: ${ALLOWED_MIMETYPES.join(', ')}`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    await ensureUploadDir();

    // Process image
    const processedBuffer = await processImage(file.buffer, file.mimetype, options);
    
    // Generate filename and path
    const filename = generateFilename(file.originalname);
    const filePath = path.join(UPLOAD_DIR, filename);
    const url = `${PUBLIC_URL_BASE}/uploads/${filename}`;

    // Write file
    await fs.writeFile(filePath, processedBuffer);

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        filename: file.originalname,
        key: filePath,
        url,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        uploadedBy,
      },
    });

    logger.info('File uploaded', {
      id: upload.id,
      filename: upload.filename,
      size: upload.size,
    });

    return {
      success: true,
      upload: {
        id: upload.id,
        filename: upload.filename,
        url: upload.url,
        mimetype: upload.mimeType,
        size: upload.size,
      },
    };
  } catch (error) {
    logger.error('File upload failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload logo with specific sizing
 */
export async function uploadLogo(
  file: UploadedFile,
  uploadedBy?: string
): Promise<UploadResult> {
  return uploadFile(file, {
    maxWidth: 500,
    maxHeight: 200,
    quality: 90,
  }, uploadedBy);
}

/**
 * Upload favicon
 */
export async function uploadFavicon(
  file: UploadedFile,
  uploadedBy?: string
): Promise<UploadResult> {
  return uploadFile(file, {
    maxWidth: 64,
    maxHeight: 64,
    format: 'png',
  }, uploadedBy);
}

/**
 * Upload hero/background image
 */
export async function uploadHeroImage(
  file: UploadedFile,
  uploadedBy?: string
): Promise<UploadResult> {
  return uploadFile(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'webp',
  }, uploadedBy);
}

/**
 * Delete an upload
 */
export async function deleteUpload(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return { success: false, error: 'Upload not found' };
    }

    // Delete file from disk
    try {
      await fs.unlink(upload.key);
    } catch {
      // File might already be deleted
    }

    // Delete from database
    await prisma.upload.delete({
      where: { id },
    });

    logger.info('Upload deleted', { id, filename: upload.filename });

    return { success: true };
  } catch (error) {
    logger.error('Delete upload failed', { error, id });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get upload by ID
 */
export async function getUpload(id: string) {
  return prisma.upload.findUnique({
    where: { id },
  });
}

/**
 * List all uploads
 */
export async function listUploads(limit = 50, offset = 0) {
  return prisma.upload.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });
}

