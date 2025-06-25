const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const huffman = require('../algorithms/huffman');
const lz77 = require('../algorithms/lz77');
const rle = require('../algorithms/rle');
const FileHandler = require('../utils/fileHandler');
const Statistics = require('../utils/statistics');
const IntegrityChecker = require('../utils/integrity');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    FileHandler.ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = FileHandler.generateUniqueFilename(file.originalname, 'upload');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    
    cb(null, true);
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { algorithm } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!algorithm || !['huffman', 'lz77', 'rle'].includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid compression algorithm' });
    }

    const inputPath = req.file.path;
    const compressedDir = path.join(__dirname, '../../compressed');
    FileHandler.ensureDirectoryExists(compressedDir);
    
    const compressedFilename = FileHandler.generateUniqueFilename(
      req.file.originalname, 
      `${algorithm}_compressed`
    );
    const outputPath = path.join(compressedDir, compressedFilename);

    
    const originalMetadata = IntegrityChecker.generateFileMetadata(inputPath);
    const originalSize = FileHandler.getFileSize(inputPath);

    
    const startTime = Date.now();
    
    try {
      switch (algorithm) {
        case 'huffman':
          huffman.compress(inputPath, outputPath);
          break;
        case 'lz77':
          lz77.compress(inputPath, outputPath);
          break;
        case 'rle':
          rle.rleCompress(inputPath, outputPath);
          break;
      }
    } catch (compressionError) {
      
      FileHandler.deleteFile(inputPath);
      throw new Error(`Compression failed: ${compressionError.message}`);
    }

    const compressionTime = Date.now() - startTime;
    const compressedSize = FileHandler.getFileSize(outputPath);
    
    
    const stats = Statistics.calculateCompressionStats(originalSize, compressedSize);
    const algorithmInfo = Statistics.getAlgorithmInfo(algorithm);

    
    FileHandler.deleteFile(inputPath);

    res.json({
      success: true,
      message: 'File compressed successfully',
      data: {
        originalFilename: req.file.originalname,
        compressedFilename,
        algorithm,
        algorithmInfo,
        statistics: {
          ...stats,
          compressionTime,
          originalSizeFormatted: Statistics.formatFileSize(originalSize),
          compressedSizeFormatted: Statistics.formatFileSize(compressedSize)
        },
        metadata: {
          original: originalMetadata,
          compressed: {
            path: outputPath,
            filename: compressedFilename
          }
        },
        downloadUrl: `/api/download/compressed/${compressedFilename}`
      }
    });

  } catch (error) {
    console.error('Compression error:', error);
    
    
    if (req.file && req.file.path) {
      FileHandler.deleteFile(req.file.path);
    }

    res.status(500).json({
      error: 'Compression failed',
      message: error.message
    });
  }
});

module.exports = router;
