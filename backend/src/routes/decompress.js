const express = require('express');
const fs = require('fs-extra'); 
const path = require('path'); 
const fileHandler = require('../utils/fileHandler');
const CompressionStatistics = require('../utils/statistics');
const IntegrityChecker = require('../utils/integrity'); 


const HuffmanCoding = require('../algorithms/huffman');
const RunLengthEncoding = require('../algorithms/rle');
const LZ77 = require('../algorithms/lz77');

const router = express.Router();


const algorithms = {
    huffman: new HuffmanCoding(),
    rle: new RunLengthEncoding(),
    lz77: new LZ77()
};


router.post('/', async (req, res, next) => {
    try {
        const { compressedFileId, algorithm, originalSize, metadataFileId } = req.body;

        if (!compressedFileId || !algorithm) {
            return res.status(400).json({
                error: true,
                code: 'MISSING_REQUIRED_DATA',
                message: 'compressedFileId and algorithm are required'
            });
        }

        
        const { buffer: compressedBuffer } = await fileHandler.readFile(compressedFileId, 'uploads');

        
        const stats = new CompressionStatistics();
        stats.startTiming();

        
        const algorithmInstance = algorithms[algorithm];
        if (!algorithmInstance) {
            return res.status(400).json({
                error: true,
                code: 'ALGORITHM_NOT_SUPPORTED',
                message: `Algorithm ${algorithm} is not supported for decompression`
            });
        }

        let decompressedBuffer;
        const estimatedSize = originalSize || Math.max(compressedBuffer.length * 3, 1024);

        try {
            switch (algorithm) {
                case 'huffman':
                    
                    try {
                        
                        const metadataFiles = await fs.readdir(fileHandler.compressedDir);
                        const metadataFile = metadataFiles.find(file => 
                            file.startsWith('metadata_') && file.includes(compressedFileId) && file.endsWith('.json')
                        );
                        
                        if (metadataFile) {
                            const metadataPath = path.join(fileHandler.compressedDir, metadataFile);
                            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
                            
                            decompressedBuffer = algorithmInstance.decompress(
                                compressedBuffer,
                                metadata.tree,
                                metadata.originalSize,
                                metadata.padding,
                                metadata.singleChar
                            );
                            console.log(`Huffman decompressed with metadata: ${decompressedBuffer.length} bytes`);
                        } else {
                            
                            console.warn('No Huffman metadata found, using simple decompression');
                            decompressedBuffer = algorithmInstance.decompressSimple(compressedBuffer, estimatedSize);
                        }
                    } catch (metadataError) {
                        console.warn('Huffman metadata error:', metadataError.message);
                        decompressedBuffer = algorithmInstance.decompressSimple(compressedBuffer, estimatedSize);
                    }
                    break;

                case 'rle':
                    decompressedBuffer = algorithmInstance.decompressSimple(compressedBuffer, estimatedSize);
                    console.log(`RLE decompressed: ${decompressedBuffer.length} bytes`);
                    break;

                case 'lz77':
                    decompressedBuffer = algorithmInstance.decompressSimple(compressedBuffer, estimatedSize);
                    console.log(`LZ77 decompressed: ${decompressedBuffer.length} bytes`);
                    break;

                default:
                    throw new Error(`Unsupported algorithm: ${algorithm}`);
            }

        } catch (algorithmError) {
            console.error(`${algorithm} decompression error:`, algorithmError.message);
            throw new Error(`${algorithm.toUpperCase()} decompression failed: ${algorithmError.message}. The file may not be compressed with this algorithm or may be corrupted.`);
        }

        stats.endTiming();

        
        if (originalSize && decompressedBuffer.length !== originalSize) {
            console.warn(`Size mismatch: expected ${originalSize}, got ${decompressedBuffer.length}`);
        }

        
        const decompressedChecksum = IntegrityChecker.generateChecksum(decompressedBuffer);
        console.log(`Decompressed data checksum: ${decompressedChecksum}`);

        
        const decompressedFile = await fileHandler.saveFile(
            decompressedBuffer,
            `decompressed_${compressedFileId}_${Date.now()}.bin`,
            'uploads'
        );

        
        const statisticsReport = {
            algorithm,
            compressedSize: compressedBuffer.length,
            decompressedSize: decompressedBuffer.length,
            processingTime: stats.getProcessingTime(),
            success: true,
            timestamp: new Date().toISOString(),
            checksum: decompressedChecksum 
        };

        res.json({
            success: true,
            decompressedFileId: decompressedFile.fileId,
            statistics: statisticsReport,
            downloadUrl: `/api/download/${decompressedFile.fileId}`,
            originalSize: decompressedBuffer.length
        });

    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                error: true,
                code: 'FILE_NOT_FOUND',
                message: 'Compressed file not found'
            });
        }

        console.error('Decompression error:', error);
        next({
            isOperational: true,
            statusCode: 500,
            code: 'DECOMPRESSION_FAILED',
            message: error.message || 'Failed to decompress file'
        });
    }
});

module.exports = router;
