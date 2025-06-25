import React from 'react';
import { Info } from 'lucide-react';

const AlgorithmSelector = ({ selectedAlgorithm, onAlgorithmChange, showInfo = true }) => {
  const algorithms = [
    {
      id: 'huffman',
      name: 'Huffman Coding',
      description: 'Variable-length prefix coding algorithm',
      bestFor: 'Text files with repeated characters',
      pros: ['Optimal for frequency-based compression', 'No information loss'],
      cons: ['Requires two passes', 'Less effective on random data']
    },
    {
      id: 'lz77',
      name: 'LZ77 Compression',
      description: 'Dictionary-based compression algorithm',
      bestFor: 'Files with repeated patterns',
      pros: ['Good for repetitive data', 'Adaptive compression'],
      cons: ['Higher time complexity', 'Memory intensive']
    },
    {
      id: 'rle',
      name: 'Run Length Encoding',
      description: 'Simple compression for consecutive repeated data',
      bestFor: 'Images with large areas of same color',
      pros: ['Very fast', 'Simple implementation'],
      cons: ['Poor performance on complex data', 'Can increase file size']
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Compression Algorithm</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        {algorithms.map((algorithm) => (
          <div
            key={algorithm.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
              selectedAlgorithm === algorithm.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onAlgorithmChange(algorithm.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="algorithm"
                    value={algorithm.id}
                    checked={selectedAlgorithm === algorithm.id}
                    onChange={() => onAlgorithmChange(algorithm.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-900">
                    {algorithm.name}
                  </label>
                </div>
                
                {showInfo && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-600">{algorithm.description}</p>
                    <p className="text-xs text-green-600">
                      <strong>Best for:</strong> {algorithm.bestFor}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-green-700 font-medium">Pros:</p>
                        <ul className="text-green-600 space-y-1">
                          {algorithm.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-red-700 font-medium">Cons:</p>
                        <ul className="text-red-600 space-y-1">
                          {algorithm.cons.map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlgorithmSelector;
