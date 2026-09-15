// uploadRoutes.ts - Handles image uploads for admin
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists (should already be created by app.ts, but safe)
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// POST /api/upload - upload one or multiple images
router.post('/', upload.array('images', 20), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const urls = files.map((file) => `/uploads/${file.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;
