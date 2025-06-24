const express = require('express');
const fileHandler = require('../utils/fileHandler');
const CompressionStatistics = require('../utils/statistics');
const { validateAlgorithm } = require('../middleware/validation');


const HuffmanCoding = require('../algorithms/huffman');
const RunLengthEncoding = require('../algorithms/rle');
const LZ77 = require('../algorithms/lz77');

const router = express.Router();


const algorithms = {
    huffman: new HuffmanCoding(),
    rle: new RunLengthEncoding(),
    lz77: new LZ77()
};


router.post('/', validateAlgorithm, async (req, res, next) => {
    try {
        const { fileId, algorithm, options = {} } = req.body;

        if (!fileId) {
            return res.status(400).json({
                error: true,
                code: 'MISSING_FILE_ID',
                message: 'File ID is required'
            });
        }

        
        const { buffer: originalBuffer, fileName: originalFileName } = await fileHandler.readFile(fileId, 'uploads');

        
        const stats = new CompressionStatistics();
        stats.startTiming();

        
        let compressionResult;
        const algorithmInstance = algorithms[algorithm];

        if (!algorithmInstance) {
            return res.status(400).json({
                error: true,
                code: 'ALGORITHM_NOT_IMPLEMENTED',
                message: `Algorithm ${algorithm} is not implemented`
            });
        }

        
        if (algorithm === 'lz77' && options.windowSize) {
            algorithmInstance.windowSize = options.windowSize;
        }

        if (algorithm === 'lz77' && options.lookaheadSize) {
            algorithmInstance.lookaheadSize = options.lookaheadSize;
        }

        
        if (algorithm === 'rle' && options.enhanced) {
            compressionResult = algorithmInstance.compressEnhanced(originalBuffer);
        } else if (algorithm === 'lz77' && options.optimized) {
            compressionResult = algorithmInstance.compressOptimized(originalBuffer);
        } else {
            compressionResult = algorithmInstance.compress(originalBuffer);
        }

        stats.endTiming();

        
        const compressedFile = await fileHandler.saveFile(
            compressionResult.compressedData,
            `compressed_${algorithm}_${fileId}.bin`,
            'compressed'
        );

        
        const compressionMetadata = {
            algorithm,
            originalFileId: fileId,
            originalFileName: originalFileName,
            originalSize: originalBuffer.length,
            compressedSize: compressionResult.compressedData.length,
            tree: compressionResult.tree || null,
            padding: compressionResult.padding || 0,
            singleChar: compressionResult.singleChar || false,
            enhanced: compressionResult.enhanced || false,
            optimized: compressionResult.optimized || false,
            options,
            checksum: require('crypto').createHash('md5').update(originalBuffer).digest('hex'),
            compressionRatio: ((originalBuffer.length - compressionResult.compressedData.length) / originalBuffer.length) * 100,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        
        const metadataFile = await fileHandler.saveFile(
            Buffer.from(JSON.stringify(compressionMetadata, null, 2)),
            `metadata_${compressedFile.fileId}.json`,
            'compressed'
        );

        
        const statisticsReport = stats.generateReport(
            originalBuffer.length,
            compressionResult.compressedData.length,
            algorithm
        );

        res.json({
            success: true,
            compressedFileId: compressedFile.fileId,
            metadataFileId: metadataFile.fileId,
            statistics: statisticsReport,
            downloadUrl: `/api/download/${compressedFile.fileId}`,
            compressionData: compressionMetadata
        });

    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                error: true,
                code: 'FILE_NOT_FOUND',
                message: 'Original file not found'
            });
        }

        console.error('Compression error:', error);
        next({
            isOperational: true,
            statusCode: 500,
            code: 'COMPRESSION_FAILED',
            message: `Failed to compress file using ${req.body.algorithm}: ${error.message}`
        });
    }
});


router.get('/algorithms', (req, res) => {
    const algorithmInfo = {
        huffman: {
            name: 'Huffman Coding',
            description: 'Variable-length encoding based on character frequency. Best for text files with uneven character distribution.',
            bestFor: ['Text files', 'Source code', 'JSON/XML files'],
            timeComplexity: 'O(n log n)',
            spaceComplexity: 'O(n)',
            features: ['Lossless compression', 'Optimal for known frequencies', 'Variable-length codes']
        },
        rle: {
            name: 'Run-Length Encoding',
            description: 'Replaces consecutive identical bytes with count-value pairs. Best for files with repetitive data.',
            bestFor: ['Images with large solid areas', 'Simple graphics', 'Data with repetitive patterns'],
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            features: ['Simple and fast', 'Good for repetitive data', 'Can increase size for random data']
        },
        lz77: {
            name: 'LZ77',
            description: 'Dictionary-based compression using sliding window. Replaces repeated strings with references to previous occurrences.',
            bestFor: ['General purpose', 'Mixed content', 'Binary files'],
            timeComplexity: 'O(n²) naive, O(n) optimized',
            spaceComplexity: 'O(window_size)',
            features: ['Dictionary-based', 'Good general compression', 'Basis for many modern algorithms']
        }
    };

    res.json({
        success: true,
        algorithms: algorithmInfo
    });
});

module.exports = router;
