import React from 'react';
import { BarChart3, Clock, HardDrive, TrendingDown, Zap, Activity, Eye, EyeOff } from 'lucide-react';

const CompressionStats = ({ stats, type = 'compression' }) => {
  if (!stats) return null;

  const getCompressionColor = (ratio) => {
    if (ratio > 50) return 'text-green-600';
    if (ratio > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateEfficiencyScore = () => {
    const ratio = Math.abs(stats.compressionRatio || 0);
    const timeScore = Math.max(0, 100 - (stats.compressionTime || 0) / 10);
    return Math.min(100, (ratio * 0.7 + timeScore * 0.3)).toFixed(2);
  };

  const getAlgorithmName = () => {
    if (stats.algorithm) return stats.algorithm.toUpperCase();
    return 'UNKNOWN';
  };

  const originalSize = stats.originalSize || stats.decompressedSize || 0;
  const compressedSize = stats.compressedSize || 0;
  const spaceSaved = originalSize - compressedSize;
  const compressionRatio = Math.abs(stats.compressionRatio || stats.expansionRatio || 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 border border-purple-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-800">
              {formatFileSize(originalSize)}
            </p>
            <p className="text-sm text-purple-600 font-medium mt-1">Original Size</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 border border-green-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-800">
              {formatFileSize(compressedSize)}
            </p>
            <p className="text-sm text-green-600 font-medium mt-1">Compressed Size</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-6 border border-orange-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-800">
              {compressionRatio.toFixed(1)}%
            </p>
            <p className="text-sm text-orange-600 font-medium mt-1">Compression Ratio</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-6 border border-pink-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-800">
              {formatTime(stats.compressionTime || stats.decompressionTime || 0)}
            </p>
            <p className="text-sm text-pink-600 font-medium mt-1">Processing Time</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics and Visual Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Space Saved:</span>
              <span className="font-semibold text-green-600">{formatFileSize(spaceSaved)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Efficiency Score:</span>
              <span className="font-semibold text-purple-600">{calculateEfficiencyScore()}/100</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Algorithm:</span>
              <span className="font-semibold text-pink-600">{getAlgorithmName()}</span>
            </div>
          </div>
        </div>

        {/* Visual Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Visual Analysis</h3>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
              <EyeOff className="h-4 w-4" />
              <span>Hide Charts</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-purple-600">
              • Very fast processing time - excellent performance!
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Size Comparison Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Comparison</h3>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">Compression Analysis</div>
            
            {/* Bar Chart Representation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Original Size</span>
                <span className="text-sm font-medium">{formatFileSize(originalSize)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div 
                  className="bg-purple-500 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: '100%' }}
                >
                  File Size (Bytes)
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Compressed Size</span>
                <span className="text-sm font-medium">{formatFileSize(compressedSize)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div 
                  className="bg-green-500 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(compressedSize / originalSize) * 100}%` }}
                >
                  Compressed
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Space Saved</span>
                <span className="text-sm font-medium">{formatFileSize(spaceSaved)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8">
                <div 
                  className="bg-orange-500 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(spaceSaved / originalSize) * 100}%` }}
                >
                  Saved
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compression Ratio Donut Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Ratio</h3>
          
          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${compressionRatio}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{compressionRatio.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Compressed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-gray-600">Original</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressionStats;
