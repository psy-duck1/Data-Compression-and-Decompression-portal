const errorHandler = (err, req, res, next) => {
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode
    });

    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: true,
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds the maximum limit of 50MB'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: true,
            code: 'INVALID_FILE_FIELD',
            message: 'Unexpected file field. Use "file" as the field name.'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            error: true,
            code: 'TOO_MANY_FILES',
            message: 'Only one file can be uploaded at a time'
        });
    }

    
    if (err.code === 'ENOENT') {
        return res.status(404).json({
            error: true,
            code: 'FILE_NOT_FOUND',
            message: 'File not found on server'
        });
    }

    if (err.code === 'EACCES') {
        return res.status(403).json({
            error: true,
            code: 'ACCESS_DENIED',
            message: 'Access denied to file'
        });
    }

    
    if (err.isOperational) {
        return res.status(err.statusCode || 400).json({
            error: true,
            code: err.code || 'APPLICATION_ERROR',
            message: err.message
        });
    }

    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: true,
            code: 'VALIDATION_ERROR',
            message: err.message
        });
    }

    
    res.status(500).json({
        error: true,
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message
    });
};

module.exports = errorHandler;
