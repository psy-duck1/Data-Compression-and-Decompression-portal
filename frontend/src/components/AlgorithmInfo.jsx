import React, { useState } from 'react';
import { Clock, HardDrive, Zap, CheckCircle, AlertCircle, Code } from 'lucide-react';

const AlgorithmInfo = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('huffman');

  const algorithms = [
    {
      id: 'huffman',
      name: 'Huffman Coding',
      icon: '🌿',
      color: 'green',
      description: 'Variable-length encoding based on character frequency. Best for text files with uneven character distribution.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      bestFor: ['Text files', 'Source code', 'JSON/XML files'],
      keyFeatures: [
        'Lossless compression',
        'Optimal for known frequencies',
        'Variable-length codes'
      ],
      usageTips: [
        'Works best with files that have uneven character distribution',
        'Requires two passes: one to build frequency table, one to encode',
        'May not be optimal for files with uniform character distribution'
      ]
    },
    {
      id: 'rle',
      name: 'Run-Length Encoding',
      icon: '📊',
      color: 'blue',
      description: 'Simple compression for consecutive repeated data. Best for images with large areas of same color.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      bestFor: ['Simple images', 'Graphics', 'Bitmap files'],
      keyFeatures: [
        'Very fast compression',
        'Simple implementation',
        'Low memory usage'
      ],
      usageTips: [
        'Excellent for images with large uniform areas',
        'Can actually increase file size for complex data',
        'Best suited for simple graphics and logos'
      ]
    },
    {
      id: 'lz77',
      name: 'LZ77',
      icon: '🔄',
      color: 'red',
      description: 'Dictionary-based compression algorithm that replaces repeated occurrences with references to previous data.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      bestFor: ['General files', 'Documents', 'Mixed content'],
      keyFeatures: [
        'Adaptive compression',
        'Good for repetitive data',
        'No dictionary storage needed'
      ],
      usageTips: [
        'Works well with files containing repeated patterns',
        'More computationally intensive than simpler algorithms',
        'Good general-purpose compression for various file types'
      ]
    }
  ];

  const selectedAlgo = algorithms.find(algo => algo.id === selectedAlgorithm);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Purple Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 rounded-lg p-2">
            <Code className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Compression Algorithms Guide</h2>
            <p className="text-purple-100 mt-1">Learn about different compression algorithms and their characteristics</p>
          </div>
        </div>
      </div>

      {/* Algorithm Selector Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {algorithms.map((algorithm) => {
            const isSelected = selectedAlgorithm === algorithm.id;
            
            return (
              <button
                key={algorithm.id}
                onClick={() => setSelectedAlgorithm(algorithm.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
                  isSelected 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                style={{ 
                  backgroundColor: isSelected ? '#faf5ff' : 'white',
                  color: isSelected ? '#9333ea' : '#6b7280'
                }}
              >
                <span className="text-lg">{algorithm.icon}</span>
                <span>{algorithm.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 bg-white">
        {/* Algorithm Title and Description */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedAlgo.name}</h3>
          <p className="text-gray-600 text-lg leading-relaxed">{selectedAlgo.description}</p>
        </div>

        {/* Complexity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-500 rounded-full p-2">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-blue-700">Time Complexity</h4>
            </div>
            <p className="text-2xl font-mono font-bold text-blue-900">{selectedAlgo.timeComplexity}</p>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-pink-500 rounded-full p-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-pink-700">Space Complexity</h4>
            </div>
            <p className="text-2xl font-mono font-bold text-pink-900">{selectedAlgo.spaceComplexity}</p>
          </div>
        </div>

        {/* Best For Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-green-500 rounded-full p-1">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-semibold text-green-700">Best For</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedAlgo.bestFor.map((item, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-gray-500 rounded-full p-1">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-700">Key Features</h4>
          </div>
          <ul className="space-y-3">
            {selectedAlgo.keyFeatures.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Usage Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-yellow-500 rounded-full p-1">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-semibold text-yellow-700">Usage Tips</h4>
          </div>
          <div className="space-y-3">
            {selectedAlgo.usageTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmInfo;
