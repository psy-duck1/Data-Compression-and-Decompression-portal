import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import AlgorithmSelector from './AlgorithmSelector';
import CompressionStats from './CompressionStats';
import FileDownload from './FileDownload';
import ApiService from '../services/api';

const DecompressUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('huffman');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDecompress = async () => {
    if (!selectedFile || !selectedAlgorithm) {
      setError('Please select a file and algorithm');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setResult(null);

      const response = await ApiService.decompressFile(selectedFile, selectedAlgorithm);
      
      const enhancedResult = {
        ...response.data,
        statistics: {
          ...response.data.statistics,
          algorithm: selectedAlgorithm
        }
      };
      setResult(enhancedResult);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">File Decompression</h2>
        
        <div className="space-y-6">
          <FileUpload
            onFileSelect={setSelectedFile}
            disabled={processing}
            accept="*/*"
          />

          <AlgorithmSelector
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            showInfo={false}
          />

          <div className="flex space-x-4">
            <button
              onClick={handleDecompress}
              disabled={!selectedFile || processing}
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Decompressing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Decompress File
                </>
              )}
            </button>

            {(result || error) && (
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-800 font-medium">Decompression Failed</p>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-800 font-medium">Decompression Successful!</p>
            </div>
            <p className="text-green-700 mt-1">
              File decompressed using {result.algorithmInfo?.name}
            </p>
          </div>

          <CompressionStats stats={result.statistics} type="decompression" />

          <FileDownload
            filename={result.decompressedFilename}
            type="decompressed"
            originalFilename={result.decompressedFilename}
          />
        </div>
      )}
    </div>
  );
};

export default DecompressUpload;
