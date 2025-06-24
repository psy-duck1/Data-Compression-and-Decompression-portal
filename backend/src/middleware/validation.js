const path = require('path');

const validateFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            error: true,
            code: 'NO_FILE_PROVIDED',
            message: 'No file was uploaded'
        });
    }

    const file = req.file;
    const maxSize = 50 * 1024 * 1024; 

    
    if (file.size > maxSize) {
        return res.status(400).json({
            error: true,
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 50MB limit'
        });
    }

    
    if (file.size < 1) {
        return res.status(400).json({
            error: true,
            code: 'FILE_TOO_SMALL',
            message: 'File is empty'
        });
    }

    
    if (!file.originalname || file.originalname.trim() === '') {
        return res.status(400).json({
            error: true,
            code: 'INVALID_FILENAME',
            message: 'File must have a valid name'
        });
    }

    
    const sanitizedName = path.basename(file.originalname);
    if (sanitizedName !== file.originalname) {
        file.originalname = sanitizedName;
    }

    
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(file.originalname)) {
        file.originalname = file.originalname.replace(invalidChars, '_');
    }

    next();
};

const validateAlgorithm = (req, res, next) => {
    const { algorithm } = req.body;
    const validAlgorithms = ['huffman', 'rle', 'lz77'];
    
    if (!algorithm || !validAlgorithms.includes(algorithm)) {
        return res.status(400).json({
            error: true,
            code: 'INVALID_ALGORITHM',
            message: `Algorithm must be one of: ${validAlgorithms.join(', ')}`
        });
    }

    next();
};


const validateDecompression = (req, res, next) => {
    const { compressedFileId, algorithm } = req.body;
    
    if (!compressedFileId) {
        return res.status(400).json({
            error: true,
            code: 'MISSING_FILE_ID',
            message: 'Compressed file ID is required'
        });
    }

    
    if (algorithm) {
        const validAlgorithms = ['huffman', 'rle', 'lz77'];
        if (!validAlgorithms.includes(algorithm)) {
            return res.status(400).json({
                error: true,
                code: 'INVALID_ALGORITHM',
                message: `Algorithm must be one of: ${validAlgorithms.join(', ')}`
            });
        }
    }

    next();
};


const validateFileId = (req, res, next) => {
    const { fileId } = req.params;
    
    if (!fileId || fileId.trim() === '') {
        return res.status(400).json({
            error: true,
            code: 'INVALID_FILE_ID',
            message: 'File ID is required and cannot be empty'
        });
    }

    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
        return res.status(400).json({
            error: true,
            code: 'INVALID_FILE_ID_FORMAT',
            message: 'File ID must be a valid UUID'
        });
    }

    next();
};

module.exports = {
    validateFile,
    validateAlgorithm,
    validateDecompression,
    validateFileId
};
