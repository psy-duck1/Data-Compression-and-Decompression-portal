class Statistics {
    static calculateCompressionRatio(originalSize, compressedSize) {
      if (originalSize === 0) return 0;
      return ((originalSize - compressedSize) / originalSize) * 100;
    }
  
    static calculateCompressionStats(originalSize, compressedSize) {
      const ratio = this.calculateCompressionRatio(originalSize, compressedSize);
      const spaceSaved = originalSize - compressedSize;
      
      return {
        originalSize,
        compressedSize,
        compressionRatio: Math.round(ratio * 100) / 100,
        spaceSaved,
        compressionFactor: originalSize / compressedSize || 0
      };
    }
  
    static formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  
    static getAlgorithmInfo(algorithm) {
      const algorithms = {
        huffman: {
          name: 'Huffman Coding',
          description: 'Variable-length prefix coding algorithm',
          bestFor: 'Text files with repeated characters',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)'
        },
        lz77: {
          name: 'LZ77 Compression',
          description: 'Dictionary-based compression algorithm',
          bestFor: 'Files with repeated patterns',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(n)'
        },
        rle: {
          name: 'Run Length Encoding',
          description: 'Simple compression for consecutive repeated data',
          bestFor: 'Images with large areas of same color',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)'
        }
      };
  
      return algorithms[algorithm] || null;
    }
  }
  
  module.exports = Statistics;
  