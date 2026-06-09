import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { query } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';
import { AppError, sanitizeInput } from '../middleware/security.js';

const router = express.Router();

// File validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists and is secure
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o700 });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

ensureUploadDir();

// Custom storage for multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userDir = path.join(UPLOAD_DIR, req.user.userId);
    try {
      await fs.mkdir(userDir, { recursive: true, mode: 0o700 });
      cb(null, userDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate random filename - don't use original
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new AppError('File type not allowed', 400));
  } else if (file.size > MAX_FILE_SIZE) {
    cb(new AppError('File too large', 400));
  } else {
    cb(null, true);
  }
};

// Multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Max 5 files per request
  }
});

// Helper to verify file headers (prevent mimetype spoofing)
async function verifyFileHeader(filePath, expectedMimeType) {
  const buffer = Buffer.alloc(8);
  const fd = await fs.open(filePath, 'r');
  await fd.read(buffer, 0, 8, 0);
  await fd.close();

  const hex = buffer.toString('hex');

  // Magic numbers for file types
  const signatures = {
    'image/jpeg': /ffd8ffe0|ffd8ffe1|ffd8ffe2|ffd8ffe3/,
    'image/png': /89504e47/,
    'image/webp': /52494646/,
    'application/pdf': /25504446/,
    'application/msword': /d0cf11e0/,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': /504b0304/
  };

  const signature = signatures[expectedMimeType];
  return signature && signature.test(hex);
}

// Calculate file hash
async function calculateFileHash(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// Upload files
router.post('/files', authenticateToken, upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files provided', 400));
    }

    const { projectId } = req.body;
    if (!projectId) {
      return next(new AppError('Project ID required', 400));
    }

    // Verify user owns the project
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.user.userId]
    );

    if (projectCheck.rows.length === 0) {
      return next(new AppError('Project not found', 404));
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Verify file header
        const headerValid = await verifyFileHeader(file.path, file.mimetype);
        if (!headerValid) {
          await fs.unlink(file.path);
          continue;
        }

        // Calculate hash
        const fileHash = await calculateFileHash(file.path);

        // Check for duplicate files
        const duplicate = await query(
          'SELECT id FROM files WHERE user_id = $1 AND file_hash = $2',
          [req.user.userId, fileHash]
        );

        if (duplicate.rows.length > 0) {
          await fs.unlink(file.path);
          continue;
        }

        // Store metadata in database
        const result = await query(
          `INSERT INTO files (project_id, user_id, file_name, file_path, file_size, file_type, mime_type, file_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, file_name, file_size, created_at`,
          [
            projectId,
            req.user.userId,
            sanitizeInput(file.originalname),
            file.path,
            file.size,
            path.extname(file.originalname).toLowerCase(),
            file.mimetype,
            fileHash
          ]
        );

        // Log upload
        await query(
          `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.user.userId, 'file_uploaded', 'file', result.rows[0].id, 'success']
        );

        uploadedFiles.push({
          id: result.rows[0].id,
          name: result.rows[0].file_name,
          size: result.rows[0].file_size,
          uploadedAt: result.rows[0].created_at
        });
      } catch (error) {
        // Clean up failed upload
        try {
          await fs.unlink(file.path);
        } catch (e) {
          // ignore
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return next(new AppError('No valid files to upload', 400));
    }

    res.status(201).json({
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    // Clean up any remaining temp files
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (e) {
          // ignore
        }
      }
    }
    next(error);
  }
});

// Get project files
router.get('/project/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify user owns the project
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.user.userId]
    );

    if (projectCheck.rows.length === 0) {
      return next(new AppError('Project not found', 404));
    }

    const result = await query(
      `SELECT id, file_name, file_size, file_type, status, created_at
       FROM files WHERE project_id = $1 ORDER BY created_at DESC`,
      [projectId]
    );

    res.json({
      files: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

// Delete file
router.delete('/file/:fileId', authenticateToken, async (req, res, next) => {
  try {
    const { fileId } = req.params;

    // Get file and verify ownership
    const fileCheck = await query(
      'SELECT file_path FROM files WHERE id = $1 AND user_id = $2',
      [fileId, req.user.userId]
    );

    if (fileCheck.rows.length === 0) {
      return next(new AppError('File not found', 404));
    }

    // Delete from filesystem
    try {
      await fs.unlink(fileCheck.rows[0].file_path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await query('DELETE FROM files WHERE id = $1', [fileId]);

    // Log deletion
    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.userId, 'file_deleted', 'file', fileId, 'success']
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
