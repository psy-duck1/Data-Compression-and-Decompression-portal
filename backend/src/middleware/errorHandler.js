const FileHandler = require('../utils/fileHandler');

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Clean up any uploaded files in case of error
  if (req.file && req.file.path) {
    FileHandler.deleteFile(req.file.path);
  }

  // Handle specific error types
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'File size exceeds the maximum limit of 50MB'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files',
      message: 'Only one file can be uploaded at a time'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field',
      message: 'File field name is incorrect'
    });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Handle file system errors
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'File not found',
      message: 'The requested file does not exist'
    });
  }

  if (err.code === 'EACCES') {
    return res.status(403).json({
      error: 'Permission denied',
      message: 'Insufficient permissions to access the file'
    });
  }

  if (err.code === 'ENOSPC') {
    return res.status(507).json({
      error: 'Insufficient storage',
      message: 'Not enough disk space available'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
};

module.exports = errorHandler;
