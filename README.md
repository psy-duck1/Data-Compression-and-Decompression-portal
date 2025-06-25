
# 🗜️ Data Compression & Decompression Portal

A modern web application for advanced file compression and decompression using multiple algorithms with beautiful visualizations and detailed analytics.

![Compression Portal](https://img.shields.io/badge/Status-Active-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v14+-green) ![React](https://img.shields.io/badge/React-18.2.0-blue) 

## 🚀 Project Description

Data Compression & Decompression Portal is a full-stack web application that provides advanced file compression and decompression functionalities using three different algorithms: Huffman Coding, LZ77, and Run-Length Encoding (RLE). The application features a modern, responsive interface with drag-and-drop file upload, real-time compression statistics, visual analytics with charts, and comprehensive algorithm information to help users understand the compression process.


## 🌐 Live Demo

- **Frontend**: [Vercel](https://data-compression-portal-alpha.vercel.app/)
- **Backend API**: [Render](https://data-compression-backend-2gla.onrender.com)
- **Demo Video**: [Live Demo Video](https://drive.google.com/drive/folders/1ybi0PkE5D-YMdoMwcn6MmHrEllfrf0E1?usp=sharing)


## ✨ Features

### Core Functionality
- **Multi-Algorithm Compression**: Support for Huffman Coding, LZ77, and Run-Length Encoding
- **File Upload & Download**: Drag-and-drop interface with support for files up to 50MB
- **Bidirectional Processing**: Both compression and decompression capabilities
- **Real-time Processing**: Live feedback during compression/decompression operations

### Advanced Analytics
- **Compression Statistics**: Detailed metrics including compression ratio, space saved, and processing time
- **Visual Charts**: Interactive bar charts and donut charts for data visualization
- **Performance Metrics**: Efficiency scoring and algorithm performance analysis
- **File Size Comparison**: Visual representation of original vs compressed file sizes

### User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Algorithm Guide**: Comprehensive information about each compression algorithm
- **Error Handling**: Robust error handling with user-friendly messages
- **Mobile Responsive**: Optimized for all device sizes
- **File Integrity**: Checksum validation for file integrity verification

### Educational Content
- **Algorithm Information**: Detailed explanations of time/space complexity
- **Use Case Recommendations**: Guidance on when to use each algorithm
- **Performance Insights**: Real-time analysis of compression effectiveness

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **File Handling**: Multer for multipart/form-data
- **Validation**: Express-validator
- **Environment**: dotenv for configuration
- **CORS**: Cross-origin resource sharing support

### Frontend
- **Framework**: React.js (v18.2.0)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API

### Compression Algorithms
- **Huffman Coding**: Variable-length prefix coding for text files
- **LZ77**: Dictionary-based compression for general files
- **Run-Length Encoding**: Simple compression for repetitive data

### Development Tools
- **Package Manager**: npm
- **Development Server**: Vite dev server
- **Code Quality**: ESLint
- **Version Control**: Git

## 📋 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Git

### Local Development Setup

#### 1. Clone the Repository
```
git clone 
cd Data-Compression-and-Decompression-portal
```

#### 2. Backend Setup
```
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables in .env
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
COMPRESSED_DIR=compressed
TEMP_DIR=temp
CLEANUP_INTERVAL=3600000

# Start development server
npm run dev
```

#### 3. Frontend Setup
```
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables in .env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Compression Portal
VITE_MAX_FILE_SIZE=52428800

# Start development server
npm run dev
```

#### 4. Access the Application
- **Frontend**: Open your browser and navigate to `http://localhost:3000`
- **Backend API**: The API server runs on `http://localhost:5000`
- **Health Check**: Visit `http://localhost:5000/api/health` to verify backend status



## 🎯 Usage Example

### Compressing a File
1. Navigate to the "Compress Files" tab
2. Drag and drop a file or click to upload
3. Select your preferred compression algorithm
4. Click "Compress File"
5. View detailed statistics and download the compressed file

### Decompressing a File
1. Navigate to the "Decompress Files" tab
2. Upload a previously compressed file
3. Select the same algorithm used for compression
4. Click "Decompress File"
5. Download the original file

### Learning About Algorithms
1. Navigate to the "Algorithm Info" tab
2. Click on any algorithm to learn about its characteristics
3. Review time/space complexity, use cases, and performance tips


## 📁 Project Structure

```
Data-Compression-and-Decompression-portal/
├── backend/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── huffman.js
│   │   │   ├── lz77.js
│   │   │   └── rle.js
│   │   ├── routes/
│   │   │   ├── compress.js
│   │   │   ├── decompress.js
│   │   │   ├── upload.js
│   │   │   └── download.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── utils/
│   │   │   ├── fileHandler.js
│   │   │   ├── statistics.js
│   │   │   └── integrity.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlgorithmInfo.jsx
│   │   │   ├── AlgorithmSelector.jsx
│   │   │   ├── CompressionStats.jsx
│   │   │   ├── DecompressUpload.jsx
│   │   │   ├── ErrorHandler.jsx
│   │   │   ├── FileDownload.jsx
│   │   │   ├── FileUpload.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```


