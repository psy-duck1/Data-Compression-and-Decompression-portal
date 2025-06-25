const { body, param, validationResult } = require('express-validator');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};


const validateAlgorithm = [
  body('algorithm')
    .isIn(['huffman', 'lz77', 'rle'])
    .withMessage('Algorithm must be one of: huffman, lz77, rle'),
  handleValidationErrors
];


const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'No file provided'
    });
  }

  
  if (req.file.size === 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Empty file not allowed'
    });
  }

  
  if (!req.file.originalname || req.file.originalname.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid filename'
    });
  }

  next();
};


const validateFilename = [
  param('filename')
    .isLength({ min: 1, max: 255 })
    .withMessage('Filename must be between 1 and 255 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Filename contains invalid characters'),
  handleValidationErrors
];


const validateFileType = [
  param('type')
    .isIn(['compressed', 'decompressed'])
    .withMessage('Type must be either compressed or decompressed'),
  handleValidationErrors
];


const rateLimitMap = new Map();

const rateLimit = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientId);
    
    if (now > clientData.resetTime) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`
      });
    }
    
    clientData.count++;
    next();
  };
};

module.exports = {
  validateAlgorithm,
  validateFile,
  validateFilename,
  validateFileType,
  rateLimit,
  handleValidationErrors
};
