const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const huffman = require('../algorithms/huffman');
const lz77 = require('../algorithms/lz77');
const rle = require('../algorithms/rle');
const FileHandler = require('../utils/fileHandler');
const Statistics = require('../utils/statistics');

const router = express.Router();

// Configure multer for compressed file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../temp');
    FileHandler.ensureDirectoryExists(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = FileHandler.generateUniqueFilename(file.originalname, 'decompress');
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { algorithm } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No compressed file uploaded' });
    }

    if (!algorithm || !['huffman', 'lz77', 'rle'].includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid decompression algorithm' });
    }

    const inputPath = req.file.path;
    const decompressedDir = path.join(__dirname, '../../temp');
    FileHandler.ensureDirectoryExists(decompressedDir);
    
    // Generate output filename
    let outputFilename = req.file.originalname;
    
    // Remove compression suffixes if present
    const compressionSuffixes = ['_huffman_compressed', '_lz77_compressed', '_rle_compressed'];
    compressionSuffixes.forEach(suffix => {
      if (outputFilename.includes(suffix)) {
        outputFilename = outputFilename.replace(suffix, '');
      }
    });
    
    const decompressedFilename = FileHandler.generateUniqueFilename(
      outputFilename, 
      `${algorithm}_decompressed`
    );
    const outputPath = path.join(decompressedDir, decompressedFilename);

    const compressedSize = FileHandler.getFileSize(inputPath);
    const startTime = Date.now();

    // Perform decompression based on algorithm
    try {
      switch (algorithm) {
        case 'huffman':
          huffman.decompress(inputPath, outputPath);
          break;
        case 'lz77':
          lz77.decompress(inputPath, outputPath);
          break;
        case 'rle':
          rle.rleDecompress(inputPath, outputPath);
          break;
      }
    } catch (decompressionError) {
      // Clean up uploaded file
      FileHandler.deleteFile(inputPath);
      throw new Error(`Decompression failed: ${decompressionError.message}`);
    }

    const decompressionTime = Date.now() - startTime;
    const decompressedSize = FileHandler.getFileSize(outputPath);
    
    // Generate decompression statistics
    const stats = Statistics.calculateCompressionStats(decompressedSize, compressedSize);
    const algorithmInfo = Statistics.getAlgorithmInfo(algorithm);

    // Clean up compressed file
    FileHandler.deleteFile(inputPath);

    res.json({
      success: true,
      message: 'File decompressed successfully',
      data: {
        originalFilename: req.file.originalname,
        decompressedFilename,
        algorithm,
        algorithmInfo,
        statistics: {
          compressedSize,
          decompressedSize,
          decompressionTime,
          expansionRatio: stats.compressionRatio, // This will be negative for expansion
          compressedSizeFormatted: Statistics.formatFileSize(compressedSize),
          decompressedSizeFormatted: Statistics.formatFileSize(decompressedSize)
        },
        downloadUrl: `/api/download/decompressed/${decompressedFilename}`
      }
    });

  } catch (error) {
    console.error('Decompression error:', error);
    
    // Clean up files in case of error
    if (req.file && req.file.path) {
      FileHandler.deleteFile(req.file.path);
    }

    res.status(500).json({
      error: 'Decompression failed',
      message: error.message
    });
  }
});

module.exports = router;
