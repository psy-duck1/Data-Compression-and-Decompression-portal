const express = require('express');
const fileHandler = require('../utils/fileHandler');
const path = require('path');
const { validateFileId } = require('../middleware/validation');

const router = express.Router();


router.get('/:fileId', validateFileId, async (req, res, next) => {
    try {
        const { fileId } = req.params;

        let fileData;
        let fileName = fileId;
        let directory = '';

        
        try {
            fileData = await fileHandler.readFile(fileId, 'compressed');
            fileName = fileData.fileName;
            directory = 'compressed';
            console.log(`Found file in compressed directory: ${fileName}, size: ${fileData.buffer.length} bytes`);
        } catch (compressedError) {
            try {
                fileData = await fileHandler.readFile(fileId, 'uploads');
                fileName = fileData.fileName;
                directory = 'uploads';
                console.log(`Found file in uploads directory: ${fileName}, size: ${fileData.buffer.length} bytes`);
            } catch (uploadsError) {
                try {
                    fileData = await fileHandler.readFile(fileId, 'temp');
                    fileName = fileData.fileName;
                    directory = 'temp';
                    console.log(`Found file in temp directory: ${fileName}, size: ${fileData.buffer.length} bytes`);
                } catch (tempError) {
                    console.error(`File not found in any directory for ID: ${fileId}`);
                    return res.status(404).json({
                        error: true,
                        code: 'FILE_NOT_FOUND',
                        message: 'File not found in any directory'
                    });
                }
            }
        }

        
        if (!fileData || !fileData.buffer) {
            console.error(`File data is invalid for ID: ${fileId}`);
            return res.status(500).json({
                error: true,
                code: 'INVALID_FILE_DATA',
                message: 'File data is corrupted or invalid'
            });
        }

        
        if (fileData.buffer.length === 0) {
            console.warn(`WARNING: Attempting to download empty file: ${fileId}`);
            return res.status(200).json({
                success: true,
                message: 'File is empty',
                fileId,
                fileName,
                size: 0
            });
        }

        
        const getContentType = (filename) => {
            const ext = filename.split('.').pop()?.toLowerCase() || '';
            const mimeTypes = {
                'txt': 'text/plain',
                'json': 'application/json',
                'xml': 'application/xml',
                'csv': 'text/csv',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'bmp': 'image/bmp',
                'pdf': 'application/pdf',
                'zip': 'application/zip',
                'bin': 'application/octet-stream',
                'html': 'text/html',
                'css': 'text/css',
                'js': 'application/javascript',
                'mp3': 'audio/mpeg',
                'mp4': 'video/mp4',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'md': 'text/markdown',
                'log': 'text/plain'
            };
            return mimeTypes[ext] || 'application/octet-stream';
        };

        
        const generateSafeFilename = (originalName) => {
            
            let safeName = originalName.replace(/[\/\\:*?"<>|]/g, '_');
            
            
            safeName = safeName.replace(/[\x00-\x1f\x80-\x9f]/g, '');
            
            
            if (safeName.length > 255) {
                const ext = path.extname(safeName);
                const nameWithoutExt = path.basename(safeName, ext);
                safeName = nameWithoutExt.substring(0, 255 - ext.length) + ext;
            }

            
            if (!safeName || safeName.trim() === '') {
                safeName = `file_${fileId}`;
            }

            return safeName;
        };

        const safeFileName = generateSafeFilename(fileName);
        const contentType = getContentType(safeFileName);

        
        console.log('Download request details:', {
            fileId,
            fileName: safeFileName,
            directory,
            size: fileData.buffer.length,
            contentType
        });

        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeFileName)}`);
        res.setHeader('Content-Length', fileData.buffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');

        
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');

        
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileData.buffer.length - 1;
            const chunksize = (end - start) + 1;

            if (start >= fileData.buffer.length || end >= fileData.buffer.length || start > end) {
                res.status(416).json({
                    error: true,
                    code: 'RANGE_NOT_SATISFIABLE',
                    message: 'Requested range not satisfiable'
                });
                return;
            }

            const chunk = fileData.buffer.slice(start, end + 1);
            res.status(206);
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileData.buffer.length}`);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunksize);
            
            console.log(`Serving partial content: ${start}-${end}/${fileData.buffer.length}`);
            res.send(chunk);
        } else {
            
            console.log(`Serving complete file: ${safeFileName} (${fileData.buffer.length} bytes)`);
            res.send(fileData.buffer);
        }

    } catch (error) {
        console.error('Download error:', {
            fileId: req.params.fileId,
            error: error.message,
            stack: error.stack
        });

        
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                error: true,
                code: 'FILE_NOT_FOUND',
                message: 'File not found on disk'
            });
        }

        if (error.code === 'EACCES') {
            return res.status(403).json({
                error: true,
                code: 'ACCESS_DENIED',
                message: 'Access denied to file'
            });
        }

        if (error.code === 'EMFILE' || error.code === 'ENFILE') {
            return res.status(503).json({
                error: true,
                code: 'SERVER_BUSY',
                message: 'Server is busy, please try again later'
            });
        }

        next({
            isOperational: true,
            statusCode: 500,
            code: 'DOWNLOAD_FAILED',
            message: `Failed to download file: ${error.message}`
        });
    }
});


router.get('/health/check', (req, res) => {
    res.json({
        status: 'OK',
        service: 'download',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});


router.get('/:fileId/info', validateFileId, async (req, res, next) => {
    try {
        const { fileId } = req.params;
        let fileData, directory = '';

        
        try {
            fileData = await fileHandler.readFile(fileId, 'compressed');
            directory = 'compressed';
        } catch {
            try {
                fileData = await fileHandler.readFile(fileId, 'uploads');
                directory = 'uploads';
            } catch {
                try {
                    fileData = await fileHandler.readFile(fileId, 'temp');
                    directory = 'temp';
                } catch {
                    return res.status(404).json({
                        error: true,
                        code: 'FILE_NOT_FOUND',
                        message: 'File not found'
                    });
                }
            }
        }

        const stats = await fileHandler.getFileStats(fileId, directory);

        res.json({
            success: true,
            fileId,
            fileName: fileData.fileName,
            directory,
            size: fileData.buffer.length,
            stats,
            downloadUrl: `/api/download/${fileId}`,
            contentType: fileData.buffer.length > 0 ? 'application/octet-stream' : 'text/plain'
        });

    } catch (error) {
        console.error('File info error:', error);
        next({
            isOperational: true,
            statusCode: 500,
            code: 'FILE_INFO_FAILED',
            message: `Failed to get file info: ${error.message}`
        });
    }
});

module.exports = router;
