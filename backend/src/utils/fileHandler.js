const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileHandler {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../../uploads');
        this.compressedDir = path.join(__dirname, '../../compressed');
        this.tempDir = path.join(__dirname, '../../temp');
        
        
        this.initPromise = this.ensureDirectories();
    }

    
    async ensureDirectories() {
        const directories = [this.uploadsDir, this.compressedDir, this.tempDir];
        for (const dir of directories) {
            await fs.ensureDir(dir);
            console.log(`✓ Directory ensured: ${dir}`);
        }
    }

    async ready() {
        await this.initPromise;
    }

    async saveFile(buffer, originalName, directory = 'uploads') {
        await this.ready(); 
        
        const fileId = uuidv4();
        const extension = path.extname(originalName);
        const fileName = `${fileId}${extension}`;
        const filePath = path.join(this[`${directory}Dir`], fileName);
        
        await fs.writeFile(filePath, buffer);
        
        return {
            fileId,
            fileName,
            filePath,
            originalName
        };
    }

    async readFile(fileId, directory = 'uploads') {
        await this.ready(); 
        
        const files = await fs.readdir(this[`${directory}Dir`]);
        const fileName = files.find(file => file.startsWith(fileId));
        
        if (!fileName) {
            throw new Error(`File with ID ${fileId} not found`);
        }

        const filePath = path.join(this[`${directory}Dir`], fileName);
        const buffer = await fs.readFile(filePath);
        
        return {
            buffer,
            fileName,
            filePath
        };
    }

    async deleteFile(fileId, directory = 'uploads') {
        try {
            await this.ready(); 
            const files = await fs.readdir(this[`${directory}Dir`]);
            const fileName = files.find(file => file.startsWith(fileId));
            
            if (fileName) {
                const filePath = path.join(this[`${directory}Dir`], fileName);
                await fs.unlink(filePath);
            }
        } catch (error) {
            console.warn(`Failed to delete file ${fileId}:`, error.message);
        }
    }

    async getFileStats(fileId, directory = 'uploads') {
        const { filePath } = await this.readFile(fileId, directory);
        const stats = await fs.stat(filePath);
        
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        };
    }

    async cleanupOldFiles(maxAge = 24 * 60 * 60 * 1000) { 
        await this.ready(); 
        
        const directories = [this.uploadsDir, this.compressedDir, this.tempDir];
        
        for (const dir of directories) {
            try {
                const files = await fs.readdir(dir);
                const now = Date.now();
                
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (now - stats.birthtime.getTime() > maxAge) {
                        await fs.unlink(filePath);
                        console.log(`Cleaned up old file: ${file}`);
                    }
                }
            } catch (error) {
                console.warn(`Failed to cleanup directory ${dir}:`, error.message);
            }
        }
    }
}

module.exports = new FileHandler();
