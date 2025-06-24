import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { apiService } from '../services/api';
import { Zap, Settings, Play, ArrowRight } from 'lucide-react';

const AlgorithmSelector = () => {
    const {
        selectedAlgorithm,
        setSelectedAlgorithm,
        uploadedFile,
        setCompressionResult,
        setCurrentStep,
        setError,
        setLoading
    } = useAppContext();

    const [algorithmInfo, setAlgorithmInfo] = useState({});
    const [options, setOptions] = useState({});
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        loadAlgorithmInfo();
    }, []);

    const loadAlgorithmInfo = async () => {
        try {
            const result = await apiService.getAlgorithmInfo();
            setAlgorithmInfo(result.algorithms);
        } catch (error) {
            console.error('Failed to load algorithm info:', error);
        }
    };

    const handleAlgorithmChange = (algorithm) => {
        setSelectedAlgorithm(algorithm);
        setOptions({}); 
    };

    const handleOptionChange = (key, value) => {
        setOptions(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const startCompression = async () => {
        if (!uploadedFile) return;

        setLoading(true);
        setError(null);

        try {
            const result = await apiService.compressFile(
                uploadedFile.fileId,
                selectedAlgorithm,
                options
            );

            setCompressionResult(result);
            
            
            setTimeout(() => {
                setCurrentStep('stats');
            }, 1000);

        } catch (error) {
            setError({
                code: 'COMPRESSION_FAILED',
                message: error.response?.data?.message || error.message || 'Failed to compress file'
            });
        } finally {
            setLoading(false);
        }
    };

    const algorithms = [
        {
            id: 'huffman',
            name: 'Huffman Coding',
            icon: '🌳',
            description: 'Variable-length encoding based on character frequency',
            bestFor: 'Text files, source code',
            pros: ['Optimal for known frequencies', 'Good compression ratio for text'],
            cons: ['Requires two passes', 'Less effective on random data']
        },
        {
            id: 'rle',
            name: 'Run-Length Encoding',
            icon: '🔄',
            description: 'Replaces consecutive identical data with count-value pairs',
            bestFor: 'Images with solid areas, repetitive data',
            pros: ['Very fast', 'Simple implementation', 'Good for repetitive data'],
            cons: ['Can increase file size', 'Poor for random data']
        },
        {
            id: 'lz77',
            name: 'LZ77',
            icon: '📚',
            description: 'Dictionary-based compression using sliding window',
            bestFor: 'General purpose, mixed content',
            pros: ['Good general compression', 'Handles various data types'],
            cons: ['More complex', 'Slower than RLE']
        }
    ];

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Choose Compression Algorithm
                    </h2>
                    <p className="text-gray-600">
                        Select the compression algorithm that best suits your file type
                    </p>
                </div>

                {}
                {uploadedFile && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">{uploadedFile.originalName}</p>
                                <p className="text-sm text-gray-600">
                                    {formatFileSize(uploadedFile.originalSize)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Ready for compression</p>
                            </div>
                        </div>
                    </div>
                )}

                {}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {algorithms.map((algorithm) => (
                        <div
                            key={algorithm.id}
                            className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                                selectedAlgorithm === algorithm.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleAlgorithmChange(algorithm.id)}
                        >
                            <div className="text-center mb-4">
                                <div className="text-3xl mb-2">{algorithm.icon}</div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {algorithm.name}
                                </h3>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 text-center">
                                {algorithm.description}
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                                    <p className="text-xs text-gray-600">{algorithm.bestFor}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-green-700 mb-1">Pros:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {algorithm.pros.map((pro, index) => (
                                            <li key={index}>• {pro}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-red-700 mb-1">Cons:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {algorithm.cons.map((con, index) => (
                                            <li key={index}>• {con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {selectedAlgorithm === algorithm.id && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {}
                {algorithmInfo[selectedAlgorithm] && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">
                            {algorithmInfo[selectedAlgorithm].name} Details
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {algorithmInfo[selectedAlgorithm].description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-medium text-gray-700 mb-2">Time Complexity:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    {algorithmInfo[selectedAlgorithm].timeComplexity}
                                </code>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-2">Space Complexity:</p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    {algorithmInfo[selectedAlgorithm].spaceComplexity}
                                </code>
                            </div>
                        </div>
                    </div>
                )}

                {}
                <div className="mb-8">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Advanced Options</span>
                        <ArrowRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                    </button>

                    {showAdvanced && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-6">
                            {selectedAlgorithm === 'lz77' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Window Size: {options.windowSize || 4096}
                                        </label>
                                        <input
                                            type="range"
                                            min="1024"
                                            max="8192"
                                            step="1024"
                                            value={options.windowSize || 4096}
                                            onChange={(e) => handleOptionChange('windowSize', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Larger window = better compression, slower processing
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedAlgorithm === 'rle' && (
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={options.enhanced || false}
                                            onChange={(e) => handleOptionChange('enhanced', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-gray-700">Enhanced RLE</span>
                                    </label>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Uses escape sequences for better compression on non-repetitive data
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {}
                <div className="text-center">
                    <button
                        onClick={startCompression}
                        disabled={!uploadedFile}
                        className="inline-flex items-center space-x-2 px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                    >
                        <Zap className="w-5 h-5" />
                        <span>Start Compression</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlgorithmSelector;
