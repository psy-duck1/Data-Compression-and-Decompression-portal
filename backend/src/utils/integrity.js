const crypto = require('crypto');
const fs = require('fs');

class IntegrityChecker {
  static generateChecksum(filePath, algorithm = 'md5') {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const hash = crypto.createHash(algorithm);
      hash.update(fileBuffer);
      return hash.digest('hex');
    } catch (error) {
      throw new Error(`Failed to generate checksum: ${error.message}`);
    }
  }

  static verifyChecksum(filePath, expectedChecksum, algorithm = 'md5') {
    try {
      const actualChecksum = this.generateChecksum(filePath, algorithm);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      return false;
    }
  }

  static generateFileMetadata(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const checksum = this.generateChecksum(filePath);
      
      return {
        size: stats.size,
        checksum,
        created: stats.birthtime,
        modified: stats.mtime,
        algorithm: 'md5'
      };
    } catch (error) {
      throw new Error(`Failed to generate metadata: ${error.message}`);
    }
  }

  static validateFileIntegrity(originalPath, processedPath) {
    try {
      const originalChecksum = this.generateChecksum(originalPath);
      const processedChecksum = this.generateChecksum(processedPath);
      
      return {
        isValid: originalChecksum === processedChecksum,
        originalChecksum,
        processedChecksum
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }
}

module.exports = IntegrityChecker;
