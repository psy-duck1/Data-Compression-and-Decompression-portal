const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileHandler {
  static generateUniqueFilename(originalName, algorithm) {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `${baseName}_${algorithm}_${timestamp}_${hash}${ext}`;
  }

  static ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  static deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static cleanupTempFiles(maxAge = 3600000) { 
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) return;

    const files = fs.readdirSync(tempDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        this.deleteFile(filePath);
      }
    });
  }

  static validateFileType(filename, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    
    const ext = path.extname(filename).toLowerCase();
    return allowedTypes.includes(ext);
  }

  static sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }
}

module.exports = FileHandler;
