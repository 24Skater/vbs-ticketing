/**
 * Upload Controller
 * Handles file upload HTTP requests
 */

import { Request, Response } from 'express';
import { asyncHandler, Errors } from '../middleware/errorHandler.middleware.js';
import * as uploadService from '../services/upload.service.js';

/**
 * Upload a general image
 * POST /api/uploads
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as uploadService.UploadedFile | undefined;
  
  if (!file) {
    throw Errors.badRequest('No file uploaded');
  }
  
  const result = await uploadService.uploadFile(file, {}, req.userId);
  
  if (!result.success) {
    throw Errors.badRequest(result.error || 'Upload failed');
  }
  
  res.status(201).json({
    success: true,
    data: result.upload,
  });
});

/**
 * Upload logo
 * POST /api/uploads/logo
 */
export const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as uploadService.UploadedFile | undefined;
  
  if (!file) {
    throw Errors.badRequest('No file uploaded');
  }
  
  const result = await uploadService.uploadLogo(file, req.userId);
  
  if (!result.success) {
    throw Errors.badRequest(result.error || 'Upload failed');
  }
  
  res.status(201).json({
    success: true,
    data: result.upload,
  });
});

/**
 * Upload favicon
 * POST /api/uploads/favicon
 */
export const uploadFavicon = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as uploadService.UploadedFile | undefined;
  
  if (!file) {
    throw Errors.badRequest('No file uploaded');
  }
  
  const result = await uploadService.uploadFavicon(file, req.userId);
  
  if (!result.success) {
    throw Errors.badRequest(result.error || 'Upload failed');
  }
  
  res.status(201).json({
    success: true,
    data: result.upload,
  });
});

/**
 * Upload hero/background image
 * POST /api/uploads/hero
 */
export const uploadHero = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as uploadService.UploadedFile | undefined;
  
  if (!file) {
    throw Errors.badRequest('No file uploaded');
  }
  
  const result = await uploadService.uploadHeroImage(file, req.userId);
  
  if (!result.success) {
    throw Errors.badRequest(result.error || 'Upload failed');
  }
  
  res.status(201).json({
    success: true,
    data: result.upload,
  });
});

/**
 * Get upload by ID
 * GET /api/uploads/:id
 */
export const getUpload = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const upload = await uploadService.getUpload(id);
  
  if (!upload) {
    throw Errors.notFound('Upload not found');
  }
  
  res.json({
    success: true,
    data: upload,
  });
});

/**
 * List uploads
 * GET /api/uploads
 */
export const listUploads = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  
  const uploads = await uploadService.listUploads(limit, offset);
  
  res.json({
    success: true,
    data: uploads,
  });
});

/**
 * Delete upload
 * DELETE /api/uploads/:id
 */
export const deleteUpload = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const result = await uploadService.deleteUpload(id);
  
  if (!result.success) {
    throw Errors.badRequest(result.error || 'Delete failed');
  }
  
  res.json({
    success: true,
    message: 'Upload deleted',
  });
});

