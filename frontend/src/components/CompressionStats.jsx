import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { apiService } from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Download, RotateCcw, TrendingDown, Clock, Zap, CheckCircle, ArrowRight } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const CompressionStats = () => {
    const {
        compressionResult,
        setCurrentStep,
        setDecompressionResult,
        setError,
        setLoading,
        uploadedFile,
        addToHistory
    } = useAppContext();

    const [showCharts, setShowCharts] = useState(true);

    
    useEffect(() => {
        if (compressionResult && addToHistory) {
            addToHistory(compressionResult);
        }
    }, [compressionResult]);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (ms) => {
        if (ms < 1000) return `${ms.toFixed(1)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    
    const goToDownload = () => {
        setCurrentStep('download');
    };

    if (!compressionResult) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-500">
                    <TrendingDown className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No compression results available</h3>
                    <p>Please compress a file first to view statistics.</p>
                </div>
            </div>
        );
    }

    const stats = compressionResult.statistics;

    
    const compressionChartData = {
        labels: ['Original Size', 'Compressed Size', 'Space Saved'],
        datasets: [
            {
                label: 'File Size (Bytes)',
                data: [
                    stats.originalSize,
                    stats.compressedSize,
                    stats.spaceSaved.bytes
                ],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  
                    'rgba(16, 185, 129, 0.8)',  
                    'rgba(245, 158, 11, 0.8)'   
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2,
            },
        ],
    };

    const ratioChartData = {
        labels: ['Compressed', 'Original'],
        datasets: [
            {
                data: [stats.compressedSize, stats.originalSize - stats.compressedSize],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(229, 231, 235, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(156, 163, 175, 1)'
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Compression Analysis',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatFileSize(value);
                    }
                }
            }
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                {}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            Compression Complete!
                        </h2>
                    </div>
                    <p className="text-gray-600">
                        Your file has been compressed using <span className="font-semibold text-primary-600">{stats.algorithm.toUpperCase()}</span>
                    </p>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                            {formatFileSize(stats.originalSize)}
                        </div>
                        <div className="text-sm text-blue-800 font-medium">Original Size</div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                            {formatFileSize(stats.compressedSize)}
                        </div>
                        <div className="text-sm text-green-800 font-medium">Compressed Size</div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                        <div className="text-2xl font-bold text-amber-600 mb-2">
                            {stats.compressionRatio.toFixed(1)}%
                        </div>
                        <div className="text-sm text-amber-800 font-medium">Compression Ratio</div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                            {formatTime(stats.processingTime)}
                        </div>
                        <div className="text-sm text-purple-800 font-medium">Processing Time</div>
                    </div>
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                            Performance Metrics
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Space Saved:</span>
                                <span className="font-semibold text-green-600">
                                    {formatFileSize(stats.spaceSaved.bytes)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Efficiency Score:</span>
                                <span className="font-semibold text-blue-600">
                                    {stats.efficiency}/100
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Algorithm:</span>
                                <span className="font-semibold text-purple-600">
                                    {stats.algorithm.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <TrendingDown className="w-5 h-5 mr-2 text-blue-500" />
                                Visual Analysis
                            </h3>
                            <button
                                onClick={() => setShowCharts(!showCharts)}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                {showCharts ? 'Hide Charts' : 'Show Charts'}
                            </button>
                        </div>

                        {}
                        <div className="text-sm text-gray-600 space-y-2">
                            {stats.compressionRatio > 50 && (
                                <div className="flex items-center space-x-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>• Excellent compression ratio! This algorithm works very well with your file type.</span>
                                </div>
                            )}
                            {stats.compressionRatio < 20 && (
                                <div className="flex items-center space-x-2 text-amber-700">
                                    <Clock className="w-4 h-4" />
                                    <span>• Low compression ratio. Consider trying a different algorithm for better results.</span>
                                </div>
                            )}
                            {stats.processingTime < 100 && (
                                <div className="flex items-center space-x-2 text-blue-700">
                                    <Zap className="w-4 h-4" />
                                    <span>• Very fast processing time - excellent performance!</span>
                                </div>
                            )}
                            {stats.efficiency > 80 && (
                                <div className="flex items-center space-x-2 text-purple-700">
                                    <TrendingDown className="w-4 h-4" />
                                    <span>• High efficiency score indicates optimal algorithm selection for this file.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {}
                {showCharts && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Size Comparison</h4>
                            <div className="h-64">
                                <Bar data={compressionChartData} options={chartOptions} />
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Compression Ratio</h4>
                            <div className="h-64">
                                <Doughnut 
                                    data={ratioChartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            },
                                        },
                                    }} 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {}
                <div className="flex justify-center">
                    <button
                        onClick={goToDownload}
                        className="flex items-center justify-center space-x-2 px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-lg"
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span>View Download Options</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompressionStats;
