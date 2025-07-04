const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const compressRoutes = require('./routes/compress');
const decompressRoutes = require('./routes/decompress');
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;


const directories = ['uploads', 'compressed', 'temp'];
directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/compressed', express.static(path.join(__dirname, '../compressed')));


app.use('/api/compress', compressRoutes);
app.use('/api/decompress', decompressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/download', downloadRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Compression Portal API is running' });
});


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
