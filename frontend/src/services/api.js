import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, 
});


api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        
        if (error.response?.status === 413) {
            throw new Error('File too large. Maximum size is 50MB.');
        }
        
        if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        }
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. The file might be too large or the server is busy.');
        }
        
        
        if (error.response?.data?.code) {
            const errorCode = error.response.data.code;
            const errorMessage = error.response.data.message;
            
            switch (errorCode) {
                case 'FILE_NOT_FOUND':
                    throw new Error('File not found on server. Please upload again.');
                case 'COMPRESSION_FAILED':
                    throw new Error(`Compression failed: ${errorMessage}`);
                case 'DECOMPRESSION_FAILED':
                    throw new Error(`Decompression failed: ${errorMessage}`);
                case 'INVALID_ALGORITHM':
                    throw new Error('Invalid compression algorithm selected.');
                default:
                    throw new Error(errorMessage || 'An unexpected error occurred.');
            }
        }
        
        throw error;
    }
);

export const apiService = {
    
    uploadFile: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });

        return response.data;
    },

    
    getFileMetadata: async (fileId) => {
        const response = await api.get(`/upload/${fileId}/metadata`);
        return response.data;
    },

    
    compressFile: async (fileId, algorithm, options = {}) => {
        const response = await api.post('/compress', {
            fileId,
            algorithm,
            options,
        });
        return response.data;
    },

    
    decompressFile: async (compressedFileId, metadataFileId, algorithm = null) => {
        const payload = {
            compressedFileId,
            metadataFileId
        };
        
        if (algorithm) {
            payload.algorithm = algorithm;
        }

        const response = await api.post('/decompress', payload);
        return response.data;
    },

    
    decompressFileSimple: async (compressedFileId, algorithm, originalSize) => {
        const response = await api.post('/decompress', {
            compressedFileId,
            algorithm,
            originalSize
        });
        return response.data;
    },

    
    getAlgorithmInfo: async () => {
        const response = await api.get('/compress/algorithms');
        return response.data;
    },

    
    downloadFile: async (fileId, filename) => {
        try {
            const response = await api.get(`/download/${fileId}`, {
                responseType: 'blob',
                timeout: 60000, 
            });

            
            if (!response.data || response.data.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || `file_${fileId}`);
            
            
            document.body.appendChild(link);
            link.click();
            
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);

            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('File not found for download');
            }
            throw error;
        }
    },

    
    getFileInfo: async (fileId) => {
        const response = await api.get(`/download/${fileId}/info`);
        return response.data;
    },

    
    healthCheck: async () => {
        const response = await api.get('/health');
        return response.data;
    },

    
    uploadMultipleFiles: async (files, onProgress) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await api.post('/upload/bulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        });

        return response.data;
    },

    
    deleteFile: async (fileId) => {
        const response = await api.delete(`/upload/${fileId}`);
        return response.data;
    }
};

export default api;
