const express = require('express');
const path = require('path');
const fs = require('fs');
const FileHandler = require('../utils/fileHandler');

const router = express.Router();

// Download compressed files
router.get('/compressed/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../compressed', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Compressed file not found' });
    }

    const fileSize = FileHandler.getFileSize(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error.message
    });
  }
});

// Download decompressed files
router.get('/decompressed/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../temp', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Decompressed file not found' });
    }

    const fileSize = FileHandler.getFileSize(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: error.message
    });
  }
});

// Get file info before download
router.get('/info/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    if (!['compressed', 'decompressed'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    const directory = type === 'compressed' ? 'compressed' : 'temp';
    const filePath = path.join(__dirname, `../../${directory}`, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileSize = FileHandler.getFileSize(filePath);
    const stats = fs.statSync(filePath);
    
    res.json({
      success: true,
      data: {
        filename,
        type,
        size: fileSize,
        sizeFormatted: require('../utils/statistics').formatFileSize(fileSize),
        created: stats.birthtime,
        modified: stats.mtime,
        downloadUrl: `/api/download/${type}/${filename}`
      }
    });

  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      error: 'Failed to get file info',
      message: error.message
    });
  }
});

module.exports = router;
