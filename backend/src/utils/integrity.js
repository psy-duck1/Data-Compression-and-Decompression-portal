const crypto = require('crypto');

class IntegrityChecker {
    static generateChecksum(buffer) {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    static verifyIntegrity(originalBuffer, decompressedBuffer) {
        const originalChecksum = this.generateChecksum(originalBuffer);
        const decompressedChecksum = this.generateChecksum(decompressedBuffer);

        return {
            match: originalChecksum === decompressedChecksum,
            originalChecksum,
            decompressedChecksum,
            sizesMatch: originalBuffer.length === decompressedBuffer.length
        };
    }
}

module.exports = IntegrityChecker;
