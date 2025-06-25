import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AlgorithmSelector from './components/AlgorithmSelector';
import CompressionStats from './components/CompressionStats';
import FileDownload from './components/FileDownload';
import DecompressUpload from './components/DecompressUpload';
import AlgorithmInfo from './components/AlgorithmInfo';
import ErrorHandler from './components/ErrorHandler';
import ApiService from './services/api';
import { Archive, PackageOpen, Info, CheckCircle, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('huffman');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('compress');

  const handleCompress = async () => {
    if (!selectedFile || !selectedAlgorithm) {
      setError('Please select a file and algorithm');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setResult(null);

      const response = await ApiService.uploadFile(selectedFile, selectedAlgorithm);
      // Add algorithm info to the stats
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

  const handleRetry = () => {
    setError(null);
    handleCompress();
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Enhanced Header - Full Width */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg">
                <Archive className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Compression Portal
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
                  Advanced file compression and decompression
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered with max-width */}
      <main className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
              <nav className="flex w-full">
                <button
                  onClick={() => setActiveTab('compress')}
                  className={`flex-1 flex items-center justify-center px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'compress'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: activeTab === 'compress' ? '#eff6ff' : 'white' }}
                >
                  <Archive className="h-5 w-5 mr-2" />
                  Compress Files
                </button>
                
                <button
                  onClick={() => setActiveTab('decompress')}
                  className={`flex-1 flex items-center justify-center px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'decompress'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: activeTab === 'decompress' ? '#eff6ff' : 'white' }}
                >
                  <PackageOpen className="h-5 w-5 mr-2" />
                  Decompress Files
                </button>
                
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 flex items-center justify-center px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === 'info'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: activeTab === 'info' ? '#eff6ff' : 'white' }}
                >
                  <Info className="h-5 w-5 mr-2" />
                  Algorithm Info
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {activeTab === 'compress' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">File Compression</h2>
                    <p className="text-gray-600 mb-8">Choose your file and compression algorithm to get started</p>
                    
                    <div className="space-y-8">
                      <FileUpload
                        onFileSelect={setSelectedFile}
                        disabled={processing}
                      />

                      <AlgorithmSelector
                        selectedAlgorithm={selectedAlgorithm}
                        onAlgorithmChange={setSelectedAlgorithm}
                      />

                      <div className="flex space-x-4">
                        <button
                          onClick={handleCompress}
                          disabled={!selectedFile || processing}
                          className="flex-1 inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                          {processing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Compressing...
                            </>
                          ) : (
                            <>
                              <Archive className="h-5 w-5 mr-3" />
                              Compress File
                            </>
                          )}
                        </button>

                        {(result || error) && (
                          <button
                            onClick={handleReset}
                            className="px-8 py-4 border border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200 hover:scale-105"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <ErrorHandler 
                    error={error} 
                    onRetry={handleRetry}
                    onReset={handleReset}
                  />

                  {result && (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                          <p className="text-green-800 font-semibold text-lg">Compression Successful!</p>
                        </div>
                        <p className="text-green-700 mt-2">
                          File compressed using <span className="font-semibold">{result.algorithmInfo?.name}</span>
                        </p>
                      </div>

                      <CompressionStats stats={result.statistics} />

                      <FileDownload
                        filename={result.compressedFilename}
                        type="compressed"
                        originalFilename={result.originalFilename}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'decompress' && <DecompressUpload />}
              {activeTab === 'info' && <AlgorithmInfo />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;