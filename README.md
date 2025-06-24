# Data-Compression-and-Decompression-portal


## 1. Project Description

**Data-Compression-and-Decompression-portal** is a full-stack web application that allows users to compress and decompress files using custom algorithms (Huffman, RLE, LZ77). It provides a user-friendly interface for uploading files, selecting compression methods, viewing detailed compression statistics, and downloading compressed or decompressed files. The backend handles all compression logic and metadata management, while the frontend offers interactive visualization and workflow management.

---

## 2. Features

- **File Compression:** Upload and compress files using Huffman, RLE, or LZ77 algorithms.
- **File Decompression:** Decompress files with automatic metadata handling.
- **Compression Statistics:** Visualize compression ratio, space saved, and processing time.
- **Download Center:** Download compressed, decompressed, and metadata files.
- **Algorithm Selection:** Choose the best algorithm for your file type.
- **Session History:** Track your recent compression/decompression sessions.
- **Robust Error Handling:** User-friendly error messages for unsupported files or corrupted data.
- **Modern UI:** Responsive, clean, and intuitive frontend built with React and Tailwind CSS.

---

## 3. Tech Stack Used

| Layer     | Technology                |
|-----------|--------------------------|
| Frontend  | React, Vite, Tailwind CSS|
| Backend   | Node.js, Express.js      |
| Compression Algorithms | Custom JS (Huffman, RLE, LZ77) |
| File Handling | fs-extra              |
| Charts    | Chart.js, react-chartjs-2|
| State Management | React Context      |
| Misc      | UUID, Helmet, CORS       |

---

## 4. Setup Instructions to Run the Project Locally

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### 4.1. Clone the Repository

```bash
git clone https://github.com/your-username/compression-portal.git
cd compression-portal
```

### 4.2. Backend Setup

```bash
cd backend
npm install
npm run dev
```
- The backend server will start on `http://localhost:5000`

### 4.3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```
- The frontend will start on `http://localhost:5173`

### 4.4. Usage

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Upload a file, select a compression algorithm, and compress.
3. View compression statistics and download your files.
4. Use the decompression tool to restore files.

---

## 5. Deployed Demo Link

> **[Live Demo](https://drive.google.com/drive/folders/1ybi0PkE5D-YMdoMwcn6MmHrEllfrf0E1?usp=sharing)**

---
