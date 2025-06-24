class CompressionStatistics {
    constructor() {
        this.startTime = null;
        this.endTime = null;
    }

    startTiming() {
        this.startTime = process.hrtime.bigint();
    }

    endTiming() {
        this.endTime = process.hrtime.bigint();
    }

    getProcessingTime() {
        if (!this.startTime || !this.endTime) {
            return 0;
        }
        return Number(this.endTime - this.startTime) / 1000000; 
    }

    calculateCompressionRatio(originalSize, compressedSize) {
        if (originalSize === 0) return 0;
        return ((originalSize - compressedSize) / originalSize) * 100;
    }

    calculateSpaceSaved(originalSize, compressedSize) {
        return {
            bytes: originalSize - compressedSize,
            percentage: this.calculateCompressionRatio(originalSize, compressedSize)
        };
    }

    generateReport(originalSize, compressedSize, algorithm) {
        const processingTime = this.getProcessingTime();
        const compressionRatio = this.calculateCompressionRatio(originalSize, compressedSize);
        const spaceSaved = this.calculateSpaceSaved(originalSize, compressedSize);

        return {
            algorithm,
            originalSize,
            compressedSize,
            compressionRatio: Math.round(compressionRatio * 100) / 100,
            spaceSaved,
            processingTime: Math.round(processingTime * 100) / 100,
            efficiency: this.calculateEfficiency(compressionRatio, processingTime),
            timestamp: new Date().toISOString()
        };
    }

    calculateEfficiency(compressionRatio, processingTime) {
        
        if (processingTime === 0) return 100;
        
        const timeScore = Math.max(0, 100 - (processingTime / 1000));
        const compressionScore = Math.min(100, compressionRatio);
        
        return Math.round(((compressionScore * 0.7) + (timeScore * 0.3)) * 100) / 100;
    }
}

module.exports = CompressionStatistics;
