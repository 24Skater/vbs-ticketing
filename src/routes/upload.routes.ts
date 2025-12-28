/**
 * Upload Routes
 * File upload endpoints for images/logos
 */

import { Router } from 'express';
import multer from 'multer';
import {
  uploadImage,
  uploadLogo,
  uploadFavicon,
  uploadHero,
  getUpload,
  listUploads,
  deleteUpload,
} from '../controllers/upload.controller.js';
import { requireAuth, requireMinRole } from '../middleware/auth.middleware.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

// All upload routes require authentication and STAFF role minimum
router.use(requireAuth);
router.use(requireMinRole('STAFF'));

// Upload endpoints
router.post('/', upload.single('file'), uploadImage);
router.post('/logo', upload.single('file'), uploadLogo);
router.post('/favicon', upload.single('file'), uploadFavicon);
router.post('/hero', upload.single('file'), uploadHero);

// Management endpoints
router.get('/', listUploads);
router.get('/:id', getUpload);
router.delete('/:id', requireMinRole('ADMIN'), deleteUpload);

export default router;

