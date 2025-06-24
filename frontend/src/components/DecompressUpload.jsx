import React, { useState, useRef } from 'react';
import { useAppContext } from '../App';
import { apiService } from '../services/api';
import { Upload, File, X, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';

const DecompressUpload = () => {
    const { setDecompressionResult, setError, setLoading, setCurrentStep } = useAppContext();
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedCompressedFile, setUploadedCompressedFile] = useState(null);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('huffman');
    const [estimatedSize, setEstimatedSize] = useState('');
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
        
        if (!file.name.includes('compressed') && !file.name.endsWith('.bin')) {
            setError({
                code: 'INVALID_FILE_TYPE',
                message: 'Please upload a compressed file (.bin format) created by this portal'
            });
            return;
        }

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
                message: 'Cannot decompress empty file'
            });
            return;
        }

        setSelectedFile(file);
        setError(null);

        
        const filename = file.name.toLowerCase();
        if (filename.includes('huffman')) {
            setSelectedAlgorithm('huffman');
        } else if (filename.includes('rle')) {
            setSelectedAlgorithm('rle');
        } else if (filename.includes('lz77')) {
            setSelectedAlgorithm('lz77');
        }

        
        setEstimatedSize((file.size * 3).toString());
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const uploadCompressedFile = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setUploadProgress(0);

        try {
            const result = await apiService.uploadFile(selectedFile, (progress) => {
                setUploadProgress(progress);
            });

            setUploadedCompressedFile({
                ...result,
                originalName: selectedFile.name,
                file: selectedFile
            });
        } catch (error) {
            setError({
                code: 'UPLOAD_FAILED',
                message: error.response?.data?.message || error.message || 'Failed to upload compressed file'
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const startDecompression = async () => {
        if (!uploadedCompressedFile || !selectedAlgorithm) return;

        setLoading(true);
        setError(null);

        try {
            const originalSizeNum = estimatedSize ? parseInt(estimatedSize) : uploadedCompressedFile.metadata.size * 3;

            const result = await apiService.decompressFileSimple(
                uploadedCompressedFile.fileId,
                selectedAlgorithm,
                originalSizeNum
            );

            setDecompressionResult(result);
            setCurrentStep('download');

        } catch (error) {
            console.error('Decompression error:', error);
            
            
            let errorMessage = 'Failed to decompress file.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message.includes('tree structure')) {
                errorMessage = 'Huffman decompression requires original compression metadata. Try using the same compression session or ensure the file was compressed with Huffman coding.';
            } else if (error.message.includes('Invalid parameters')) {
                errorMessage = 'LZ77 decompression failed due to corrupted data or wrong algorithm selection. Verify you selected the correct algorithm.';
            } else if (error.message.includes('run length')) {
                errorMessage = 'RLE decompression failed. The file might not be RLE compressed or is corrupted.';
            } else if (error.message.includes('not found')) {
                errorMessage = 'Compressed file not found. Please upload the file again.';
            }

            setError({
                code: 'DECOMPRESSION_FAILED',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadedCompressedFile(null);
        setUploadProgress(0);
        setEstimatedSize('');
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

    const algorithms = [
        {
            id: 'huffman',
            name: 'Huffman Coding',
            icon: '🌳',
            description: 'Best for text files with character frequency patterns'
        },
        {
            id: 'rle',
            name: 'Run-Length Encoding',
            icon: '🔄',
            description: 'Best for files with repetitive data patterns'
        },
        {
            id: 'lz77',
            name: 'LZ77',
            icon: '📚',
            description: 'General-purpose dictionary-based compression'
        }
    ];

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Decompress File
                    </h2>
                    <p className="text-gray-600">
                        Upload a compressed file (.bin) to decompress it back to its original form.
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
                        accept=".bin,*"
                    />

                    {!selectedFile ? (
                        <div className="space-y-4">
                            <RotateCcw className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                                <p className="text-lg font-medium text-gray-900">
                                    Drop compressed files here or click to browse
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Accepts .bin files from this compression portal
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
                                        {formatFileSize(selectedFile.size)} • Compressed File
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
                {selectedFile && uploadProgress === 0 && !uploadedCompressedFile && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={uploadCompressedFile}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Upload Compressed File</span>
                        </button>
                    </div>
                )}

                {}
                {uploadedCompressedFile && (
                    <div className="mt-8 space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-green-800">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">File uploaded successfully!</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Select Compression Algorithm
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {algorithms.map((algorithm) => (
                                    <div
                                        key={algorithm.id}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                            selectedAlgorithm === algorithm.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedAlgorithm(algorithm.id)}
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">{algorithm.icon}</div>
                                            <h4 className="font-medium text-gray-900 mb-1">
                                                {algorithm.name}
                                            </h4>
                                            <p className="text-xs text-gray-600">
                                                {algorithm.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Original Size (bytes)
                            </label>
                            <input
                                type="number"
                                value={estimatedSize}
                                onChange={(e) => setEstimatedSize(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Optional: Provide the original file size for better decompression accuracy"
                            />
                        </div>

                        {}
                        <div className="text-center">
                            <button
                                onClick={startDecompression}
                                className="inline-flex items-center space-x-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-lg"
                            >
                                <RotateCcw className="w-5 h-5" />
                                <span>Start Decompression</span>
                            </button>
                        </div>
                    </div>
                )}

                {}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">Decompression Notes</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Only upload files compressed by this portal for best results</li>
                                <li>• Select the same algorithm used for compression</li>
                                <li>• Providing the original size helps with accuracy</li>
                                <li>• Huffman decompression works best with metadata from the same session</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DecompressUpload;
