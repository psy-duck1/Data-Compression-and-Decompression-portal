const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fileHandler = require('../utils/fileHandler');
const { validateFile, validateFileId } = require('../middleware/validation');

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, 
        files: 1
    },
    fileFilter: (req, file, cb) => {
        
        if (!file.originalname || file.originalname.trim() === '') {
            return cb(new Error('File must have a valid name'));
        }
        
        
        const sanitizedName = path.basename(file.originalname);
        file.originalname = sanitizedName;
        
        
        const allowedExtensions = /\.(txt|json|xml|csv|jpg|jpeg|png|gif|bmp|pdf|zip|bin|html|css|js|mp3|mp4|doc|docx|xls|xlsx|md|log)$/i;
        if (!allowedExtensions.test(file.originalname)) {
            console.warn(`Potentially unsafe file type: ${file.originalname}`);
        }
        
        cb(null, true);
    }
});


router.post('/', upload.single('file'), validateFile, async (req, res, next) => {
    try {
        const file = req.file;
        
        
        await fileHandler.ready();
        
        
        const savedFile = await fileHandler.saveFile(
            file.buffer,
            file.originalname,
            'uploads'
        );

        
        const metadata = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            uploadTime: new Date().toISOString(),
            encoding: file.encoding || 'binary',
            fieldname: file.fieldname,
            checksum: require('crypto').createHash('md5').update(file.buffer).digest('hex')
        };

        console.log(`File uploaded successfully: ${file.originalname} (${file.size} bytes)`);

        res.json({
            success: true,
            fileId: savedFile.fileId,
            originalSize: file.size,
            metadata,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        next({
            isOperational: true,
            statusCode: 500,
            code: 'UPLOAD_FAILED',
            message: `Failed to upload file: ${error.message}`
        });
    }
});


router.get('/:fileId/metadata', validateFileId, async (req, res, next) => {
    try {
        const { fileId } = req.params;
        
        
        let stats, directory = 'uploads';
        try {
            stats = await fileHandler.getFileStats(fileId, 'uploads');
        } catch (uploadsError) {
            try {
                stats = await fileHandler.getFileStats(fileId, 'compressed');
                directory = 'compressed';
            } catch (compressedError) {
                return res.status(404).json({
                    error: true,
                    code: 'FILE_NOT_FOUND',
                    message: 'File not found in any directory'
                });
            }
        }

        res.json({
            success: true,
            fileId,
            directory,
            stats
        });

    } catch (error) {
        console.error('Metadata retrieval error:', error);
        next({
            isOperational: true,
            statusCode: 500,
            code: 'METADATA_FAILED',
            message: `Failed to retrieve metadata: ${error.message}`
        });
    }
});


router.delete('/:fileId', validateFileId, async (req, res, next) => {
    try {
        const { fileId } = req.params;
        
        
        await Promise.allSettled([
            fileHandler.deleteFile(fileId, 'uploads'),
            fileHandler.deleteFile(fileId, 'compressed'),
            fileHandler.deleteFile(fileId, 'temp')
        ]);

        console.log(`File deleted: ${fileId}`);

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        next({
            isOperational: true,
            statusCode: 500,
            code: 'DELETE_FAILED',
            message: `Failed to delete file: ${error.message}`
        });
    }
});


router.post('/bulk', upload.array('files', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: true,
                code: 'NO_FILES_PROVIDED',
                message: 'No files were uploaded'
            });
        }

        await fileHandler.ready();
        
        const results = [];
        const errors = [];

        for (const file of req.files) {
            try {
                const savedFile = await fileHandler.saveFile(
                    file.buffer,
                    file.originalname,
                    'uploads'
                );

                const metadata = {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    uploadTime: new Date().toISOString(),
                    checksum: require('crypto').createHash('md5').update(file.buffer).digest('hex')
                };

                results.push({
                    success: true,
                    fileId: savedFile.fileId,
                    originalSize: file.size,
                    metadata
                });

            } catch (fileError) {
                errors.push({
                    filename: file.originalname,
                    error: fileError.message
                });
            }
        }

        res.json({
            success: errors.length === 0,
            uploaded: results.length,
            failed: errors.length,
            results,
            errors
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        next(error);
    }
});

module.exports = router;
