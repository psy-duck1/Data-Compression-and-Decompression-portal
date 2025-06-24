const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs-extra');


const uploadRoutes = require('./routes/upload');
const compressRoutes = require('./routes/compress');
const decompressRoutes = require('./routes/decompress');
const downloadRoutes = require('./routes/download');


const errorHandler = require('./middleware/errorHandler');


const app = express();
const PORT = process.env.PORT || 5000;


app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


const ensureDirectories = async () => {
    const dirs = ['uploads', 'compressed', 'temp'];
    for (const dir of dirs) {
        await fs.ensureDir(path.join(__dirname, '..', dir));
        console.log(`✓ Directory ensured: ${dir}`);
    }
};


app.use('/api/upload', uploadRoutes);
app.use('/api/compress', compressRoutes);
app.use('/api/decompress', decompressRoutes);
app.use('/api/download', downloadRoutes);


app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});


app.use(errorHandler);


app.use('*catchall', (req, res) => {
    res.status(404).json({
        error: true,
        code: 'NOT_FOUND',
        message: 'Endpoint not found'
    });
});


const startServer = async () => {
    try {
        await ensureDirectories();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📁 Upload directory: ${path.join(__dirname, '..', 'uploads')}`);
            console.log(`📦 Compressed directory: ${path.join(__dirname, '..', 'compressed')}`);
            console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
