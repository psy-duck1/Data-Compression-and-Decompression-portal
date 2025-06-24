import React, { useState, useRef } from 'react';
import { useAppContext } from '../App';
import { apiService } from '../services/api';
import { Upload, File, X, CheckCircle } from 'lucide-react';

const FileUpload = () => {
    const { setUploadedFile, setCurrentStep, setError, setLoading } = useAppContext();
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError({
                code: 'FILE_TOO_LARGE',
                message: 'File size exceeds 50MB limit'
            });
            return;
        }

        if (file.size === 0) {
            setError({
                code: 'FILE_EMPTY',
                message: 'Cannot upload empty file'
            });
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) return;
        
        setLoading(true);
        setUploadProgress(0);
        
        try {
            const result = await apiService.uploadFile(selectedFile, (progress) => {
                setUploadProgress(progress);
            });

            setUploadedFile({
                ...result,
                originalName: selectedFile.name,
                file: selectedFile
            });
            
            
            setTimeout(() => {
                setCurrentStep('compress');
            }, 1000);
            
        } catch (error) {
            setError({
                code: 'UPLOAD_FAILED',
                message: error.response?.data?.message || error.message || 'Failed to upload file'
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Upload File for Compression
                    </h2>
                    <p className="text-gray-600">
                        Select a file to compress. Supports all file types up to 50MB.
                    </p>
                </div>

                {}
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragActive
                            ? 'border-primary-500 bg-primary-50'
                            : selectedFile
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileInputChange}
                        accept="*/*"
                    />

                    {!selectedFile ? (
                        <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                                <p className="text-lg font-medium text-gray-900">
                                    Drop files here or click to browse
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Maximum file size: 50MB
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-3">
                                <File className="w-8 h-8 text-green-500" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                                    </p>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-red-500" />
                                </button>
                            </div>

                            {}
                            {uploadProgress > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {}
                {selectedFile && uploadProgress === 0 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={uploadFile}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Upload File</span>
                        </button>
                    </div>
                )}

                {}
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-3">
                        Recommended File Types by Algorithm
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-green-700 mb-1">Huffman Coding</div>
                            <div className="text-gray-600">Text files, source code, JSON, XML</div>
                        </div>
                        <div>
                            <div className="font-medium text-blue-700 mb-1">Run-Length Encoding</div>
                            <div className="text-gray-600">Images, graphics, repetitive data</div>
                        </div>
                        <div>
                            <div className="font-medium text-purple-700 mb-1">LZ77</div>
                            <div className="text-gray-600">General purpose, mixed content</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
