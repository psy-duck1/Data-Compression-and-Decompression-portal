import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Book, TrendingUp, Clock, Zap, Info, CheckCircle, AlertCircle } from 'lucide-react';

const AlgorithmInfo = () => {
    const [algorithmData, setAlgorithmData] = useState({});
    const [activeTab, setActiveTab] = useState('huffman');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlgorithmInfo();
    }, []);

    const loadAlgorithmInfo = async () => {
        try {
            const result = await apiService.getAlgorithmInfo();
            setAlgorithmData(result.algorithms);
        } catch (error) {
            console.error('Failed to load algorithm info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-gray-600">Loading algorithm information...</span>
                </div>
            </div>
        );
    }

    if (!algorithmData || Object.keys(algorithmData).length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Algorithm Information Unavailable</h3>
                    <p>Unable to load algorithm details. Please check your connection.</p>
                </div>
            </div>
        );
    }

    const algorithms = [
        { id: 'huffman', name: 'Huffman Coding', icon: '🌳', color: 'green' },
        { id: 'rle', name: 'Run-Length Encoding', icon: '🔄', color: 'blue' },
        { id: 'lz77', name: 'LZ77', icon: '📚', color: 'purple' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex items-center space-x-3">
                    <Book className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Compression Algorithms Guide</h2>
                        <p className="text-blue-100">Learn about different compression algorithms and their characteristics</p>
                    </div>
                </div>
            </div>

            {}
            <div className="border-b border-gray-200">
                <div className="flex">
                    {algorithms.map((algorithm) => (
                        <button
                            key={algorithm.id}
                            onClick={() => setActiveTab(algorithm.id)}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                activeTab === algorithm.id
                                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-2xl">{algorithm.icon}</span>
                                <span>{algorithm.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {}
            <div className="p-6">
                {algorithmData[activeTab] && (
                    <div className="space-y-6">
                        {}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {algorithmData[activeTab].name}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {algorithmData[activeTab].description}
                            </p>
                        </div>

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-900">Time Complexity</h4>
                                </div>
                                <code className="bg-blue-100 px-3 py-1 rounded text-blue-800 font-mono">
                                    {algorithmData[activeTab].timeComplexity}
                                </code>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    <h4 className="font-semibold text-purple-900">Space Complexity</h4>
                                </div>
                                <code className="bg-purple-100 px-3 py-1 rounded text-purple-800 font-mono">
                                    {algorithmData[activeTab].spaceComplexity}
                                </code>
                            </div>
                        </div>

                        {}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-green-900">Best For</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {algorithmData[activeTab].bestFor.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <CheckCircle className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold text-gray-900">Key Features</h4>
                            </div>
                            <ul className="space-y-2">
                                {algorithmData[activeTab].features.map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-2 text-gray-700">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <Info className="w-5 h-5 text-yellow-600" />
                                <h4 className="font-semibold text-yellow-900">Usage Tips</h4>
                            </div>
                            <div className="text-yellow-800 text-sm space-y-1">
                                {activeTab === 'huffman' && (
                                    <>
                                        <p>• Works best with files that have uneven character distribution</p>
                                        <p>• Requires two passes: one to build frequency table, one to encode</p>
                                        <p>• Metadata (tree structure) is essential for decompression</p>
                                    </>
                                )}
                                {activeTab === 'rle' && (
                                    <>
                                        <p>• Excellent for files with many consecutive repeated bytes</p>
                                        <p>• Can actually increase file size for random data</p>
                                        <p>• Very fast compression and decompression</p>
                                    </>
                                )}
                                {activeTab === 'lz77' && (
                                    <>
                                        <p>• Good general-purpose compression for various file types</p>
                                        <p>• Window size affects compression ratio vs. speed trade-off</p>
                                        <p>• Forms the basis for many modern compression formats</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlgorithmInfo;
