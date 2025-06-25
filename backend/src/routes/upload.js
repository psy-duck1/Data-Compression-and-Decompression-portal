const express = require('express');
const path = require('path');
const multer = require('multer');
const FileHandler = require('../utils/fileHandler');
const IntegrityChecker = require('../utils/integrity');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    FileHandler.ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = FileHandler.sanitizeFilename(file.originalname);
    const uniqueName = FileHandler.generateUniqueFilename(sanitizedName, 'upload');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, 
    files: 1
  },
  fileFilter: (req, file, cb) => {
    
    if (file.size === 0) {
      return cb(new Error('Empty file not allowed'), false);
    }
    cb(null, true);
  }
});


router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileSize = FileHandler.getFileSize(filePath);
    
    
    const metadata = IntegrityChecker.generateFileMetadata(filePath);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: fileSize,
        sizeFormatted: require('../utils/statistics').formatFileSize(fileSize),
        mimetype: req.file.mimetype,
        uploadPath: req.file.path,
        metadata,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    
    if (req.file && req.file.path) {
      FileHandler.deleteFile(req.file.path);
    }

    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});


router.get('/status/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileSize = FileHandler.getFileSize(filePath);
    const metadata = IntegrityChecker.generateFileMetadata(filePath);

    res.json({
      success: true,
      data: {
        filename,
        exists: true,
        size: fileSize,
        sizeFormatted: require('../utils/statistics').formatFileSize(fileSize),
        metadata
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check file status',
      message: error.message
    });
  }
});

module.exports = router;
