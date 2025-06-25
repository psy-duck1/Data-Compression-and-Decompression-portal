const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  static async uploadFile(file, algorithm) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);

    const response = await fetch(`${API_BASE_URL}/compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Compression failed');
    }

    return response.json();
  }

  static async decompressFile(file, algorithm) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);

    const response = await fetch(`${API_BASE_URL}/decompress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Decompression failed');
    }

    return response.json();
  }

  static async downloadFile(type, filename) {
    const response = await fetch(`${API_BASE_URL}/download/${type}/${filename}`);
    
    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  static async getFileInfo(type, filename) {
    const response = await fetch(`${API_BASE_URL}/download/info/${type}/${filename}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get file info');
    }

    return response.json();
  }

  static async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

export default ApiService;
