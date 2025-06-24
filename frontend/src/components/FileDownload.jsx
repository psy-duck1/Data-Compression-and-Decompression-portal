import React from 'react';
import { useAppContext } from '../App';
import { apiService } from '../services/api';
import { Download, CheckCircle, RotateCcw, Home, ArrowRight } from 'lucide-react';

const FileDownload = () => {
    const {
        decompressionResult,
        compressionResult,
        uploadedFile,
        setCurrentStep,
        setUploadedFile,
        setCompressionResult,
        setDecompressionResult,
        setError,
        setLoading
    } = useAppContext();

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadDecompressedFile = async () => {
        try {
            setLoading(true);
            
            const originalExtension = uploadedFile?.originalName?.split('.').pop() || 'txt';
            const baseName = uploadedFile?.originalName?.replace(/\.[^/.]+$/, "") || 'file';
            const filename = `decompressed_${baseName}.${originalExtension}`;
            
            await apiService.downloadFile(
                decompressionResult.decompressedFileId,
                filename
            );
        } catch (error) {
            setError({
                code: 'DOWNLOAD_FAILED',
                message: 'Failed to download decompressed file: ' + error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadCompressedFile = async () => {
        try {
            setLoading(true);
            const algorithm = compressionResult?.statistics?.algorithm || 'compressed';
            const baseName = uploadedFile?.originalName?.replace(/\.[^/.]+$/, "") || 'file';
            const filename = `${algorithm}_${baseName}.bin`;
            
            await apiService.downloadFile(
                compressionResult.compressedFileId,
                filename
            );
        } catch (error) {
            setError({
                code: 'DOWNLOAD_FAILED',
                message: 'Failed to download compressed file: ' + error.message
            });
        } finally {
            setLoading(false);
        }
    };

    
    const downloadMetadata = async () => {
        try {
            setLoading(true);
            const baseName = uploadedFile?.originalName?.replace(/\.[^/.]+$/, "") || 'file';
            const filename = `metadata_${baseName}.json`;
            
            await apiService.downloadFile(
                compressionResult.metadataFileId,
                filename
            );
        } catch (error) {
            setError({
                code: 'DOWNLOAD_FAILED',
                message: 'Failed to download metadata file: ' + error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const startOver = () => {
        setCurrentStep('upload');
        setUploadedFile(null);
        setCompressionResult(null);
        setDecompressionResult(null);
        setError(null);
    };

    const goBackToStats = () => {
        setCurrentStep('stats');
    };

    
    const goToDecompress = () => {
        setCurrentStep('decompress');
    };

    if (!decompressionResult && !compressionResult) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-500">
                    <Download className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No files available for download</h3>
                    <p>Please compress a file first to access download options.</p>
                    <button
                        onClick={() => setCurrentStep('upload')}
                        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Start Upload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            {decompressionResult ? 'Compression & Decompression Complete!' : 'Compression Complete!'}
                        </h2>
                    </div>
                    <p className="text-gray-600">
                        {decompressionResult 
                            ? 'Your file has been successfully compressed and decompressed' 
                            : 'Your file has been successfully compressed'
                        }
                    </p>
                </div>

                {}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4 md:space-x-8">
                        {}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                                <div className="text-2xl">📄</div>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Original File</h3>
                            <p className="text-sm text-gray-600 mb-1">{uploadedFile?.originalName}</p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(compressionResult?.statistics?.originalSize || 0)}
                            </p>
                        </div>

                        <ArrowRight className="w-6 h-6 text-gray-400" />

                        {}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                                <div className="text-2xl">🗜️</div>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Compressed</h3>
                            <p className="text-sm text-gray-600 mb-1">
                                {compressionResult?.statistics?.algorithm?.toUpperCase()} Algorithm
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(compressionResult?.statistics?.compressedSize || 0)}
                            </p>
                        </div>

                        {decompressionResult && (
                            <>
                                <ArrowRight className="w-6 h-6 text-gray-400" />
                                
                                {}
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                                        <div className="text-2xl">📋</div>
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">Decompressed</h3>
                                    <p className="text-sm text-gray-600 mb-1">Restored Original</p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(decompressionResult.originalSize)}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600 mb-1">
                            {compressionResult.statistics.compressionRatio.toFixed(1)}%
                        </div>
                        <div className="text-sm text-amber-800">Compression Ratio</div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatFileSize(compressionResult.statistics.spaceSaved.bytes)}
                        </div>
                        <div className="text-sm text-green-800">Space Saved</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {compressionResult.statistics.processingTime.toFixed(1)}ms
                        </div>
                        <div className="text-sm text-blue-800">Processing Time</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {compressionResult.statistics.efficiency}/100
                        </div>
                        <div className="text-sm text-purple-800">Efficiency Score</div>
                    </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Download className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Compressed File</h3>
                                <p className="text-sm text-gray-600">
                                    Download the compressed version of your file
                                </p>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                <strong>Algorithm:</strong> {compressionResult?.statistics?.algorithm?.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Size:</strong> {formatFileSize(compressionResult?.statistics?.compressedSize || 0)}
                            </p>
                        </div>

                        <button
                            onClick={downloadCompressedFile}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download Compressed</span>
                        </button>
                    </div>

                    {}
                    {decompressionResult ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <RotateCcw className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Decompressed File</h3>
                                    <p className="text-sm text-gray-600">
                                        Download the restored original file
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    <strong>Status:</strong> Lossless restoration
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Size:</strong> {formatFileSize(decompressionResult.originalSize)}
                                </p>
                            </div>

                            <button
                                onClick={downloadDecompressedFile}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download Decompressed</span>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <RotateCcw className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Test Decompression</h3>
                                    <p className="text-sm text-gray-600">
                                        Verify compression integrity
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4">
                                Test the decompression to ensure your file can be restored perfectly.
                            </p>

                            <button
                                onClick={goToDecompress}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Test Decompression</span>
                            </button>
                        </div>
                    )}
                </div>

                {}
                {compressionResult?.metadataFileId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-blue-900">Compression Metadata</h4>
                                <p className="text-sm text-blue-700">
                                    Download the metadata file containing compression details and tree structure
                                </p>
                            </div>
                            <button
                                onClick={downloadMetadata}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                                Download Metadata
                            </button>
                        </div>
                    </div>
                )}

                {}
                {decompressionResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div>
                                <h4 className="font-medium text-green-900">Compression Verified!</h4>
                                <p className="text-sm text-green-700">
                                    The file was successfully compressed and decompressed. The decompressed file should be 
                                    identical to your original file, confirming the compression was lossless.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={goToDecompress}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>Try Decompression Tool</span>
                    </button>

                    <button
                        onClick={startOver}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                        <Home className="w-5 h-5" />
                        <span>Start Over</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileDownload;
