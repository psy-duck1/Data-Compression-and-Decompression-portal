import React, { useState, useContext, createContext, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AlgorithmSelector from './components/AlgorithmSelector';
import CompressionStats from './components/CompressionStats';
import FileDownload from './components/FileDownload';
import AlgorithmInfo from './components/AlgorithmInfo';
import ErrorHandler from './components/ErrorHandler';
import DecompressUpload from './components/DecompressUpload';
import { Upload, Download, Info, BarChart3, RotateCcw, Zap } from 'lucide-react';
import { apiService } from './services/api';


const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

function App() {
    const [currentStep, setCurrentStep] = useState('upload');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('huffman');
    const [compressionResult, setCompressionResult] = useState(null);
    const [decompressionResult, setDecompressionResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
    
    
    const [serverHealth, setServerHealth] = useState('unknown');
    const [compressionHistory, setCompressionHistory] = useState([]);

    
    useEffect(() => {
        checkServerHealth();
    }, []);

    const checkServerHealth = async () => {
        try {
            await apiService.healthCheck();
            setServerHealth('healthy');
        } catch (error) {
            setServerHealth('unhealthy');
            console.warn('Server health check failed:', error.message);
        }
    };

    
    const contextValue = {
        currentStep,
        setCurrentStep,
        uploadedFile,
        setUploadedFile,
        selectedAlgorithm,
        setSelectedAlgorithm,
        compressionResult,
        setCompressionResult,
        decompressionResult,
        setDecompressionResult,
        error,
        setError,
        loading,
        setLoading,
        showAlgorithmInfo,
        setShowAlgorithmInfo,
        serverHealth,
        compressionHistory,
        setCompressionHistory,
        
        
        resetAll: () => {
            setCurrentStep('upload');
            setUploadedFile(null);
            setCompressionResult(null);
            setDecompressionResult(null);
            setError(null);
            setLoading(false);
        },
        
        addToHistory: (result) => {
            setCompressionHistory(prev => [result, ...prev.slice(0, 9)]); 
        }
    };

    const steps = [
        { id: 'upload', name: 'Upload', icon: Upload, description: 'Select file to compress' },
        { id: 'compress', name: 'Compress', icon: Zap, description: 'Choose algorithm and compress' },
        { id: 'stats', name: 'Statistics', icon: BarChart3, description: 'View compression results' },
        { id: 'download', name: 'Download', icon: Download, description: 'Download processed files' },
        { id: 'decompress', name: 'Decompress', icon: RotateCcw, description: 'Upload compressed file to decompress' }
    ];

    
    const getStepStatus = (stepId) => {
        const stepIndex = steps.findIndex(s => s.id === stepId);
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    const canNavigateToStep = (stepId) => {
        switch (stepId) {
            case 'upload':
                return true;
            case 'compress':
                return uploadedFile !== null;
            case 'stats':
                return compressionResult !== null;
            case 'download':
                return compressionResult !== null;
            case 'decompress':
                return true; 
            default:
                return false;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Data Compression Portal
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Upload, compress, and download files using various compression algorithms
                                </p>
                            </div>
                            
                            {}
                            <div className="flex items-center space-x-4">
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                                    serverHealth === 'healthy' 
                                        ? 'bg-green-100 text-green-800' 
                                        : serverHealth === 'unhealthy'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        serverHealth === 'healthy' 
                                            ? 'bg-green-500' 
                                            : serverHealth === 'unhealthy'
                                            ? 'bg-red-500'
                                            : 'bg-gray-500'
                                    }`} />
                                    <span>
                                        {serverHealth === 'healthy' ? 'Online' : 
                                         serverHealth === 'unhealthy' ? 'Offline' : 'Checking...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const status = getStepStatus(step.id);
                                const canNavigate = canNavigateToStep(step.id);

                                return (
                                    <div key={step.id} className="flex items-center">
                                        <button
                                            onClick={() => canNavigate && setCurrentStep(step.id)}
                                            disabled={!canNavigate}
                                            className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-200 ${
                                                status === 'active'
                                                    ? 'bg-primary-100 text-primary-700 shadow-md'
                                                    : status === 'completed'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : canNavigate
                                                    ? 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                            } ${canNavigate ? 'cursor-pointer' : ''}`}
                                            title={step.description}
                                        >
                                            <div className={`p-3 rounded-full ${
                                                status === 'active'
                                                    ? 'bg-primary-500 text-white'
                                                    : status === 'completed'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-medium text-sm">{step.name}</div>
                                                <div className="text-xs opacity-75">{step.description}</div>
                                            </div>
                                        </button>
                                        
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-4 ${
                                                getStepStatus(steps[index + 1].id) === 'completed' || 
                                                getStepStatus(steps[index + 1].id) === 'active'
                                                    ? 'bg-primary-300'
                                                    : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {}
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <Info className="w-4 h-4" />
                            <span>Algorithm Information</span>
                        </button>
                    </div>

                    {}
                    {showAlgorithmInfo && (
                        <div className="mb-8 animate-fade-in">
                            <AlgorithmInfo />
                        </div>
                    )}

                    {}
                    {error && (
                        <div className="mb-6">
                            <ErrorHandler 
                                error={error} 
                                onClose={() => setError(null)}
                                onRetry={() => {
                                    setError(null);
                                    
                                }}
                                onReset={() => {
                                    contextValue.resetAll();
                                }}
                            />
                        </div>
                    )}

                    {}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {currentStep === 'upload' && <FileUpload />}
                        {currentStep === 'compress' && <AlgorithmSelector />}
                        {currentStep === 'stats' && <CompressionStats />}
                        {currentStep === 'download' && <FileDownload />}
                        {currentStep === 'decompress' && <DecompressUpload />}
                    </div>

                    {}
                    {loading && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                                    <div className="text-lg font-medium text-gray-900">Processing...</div>
                                    <div className="text-sm text-gray-600 text-center">
                                        Please wait while we process your file. This may take a moment for large files.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {}
                <footer className="bg-gray-50 border-t border-gray-200 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center text-gray-600">
                            <p>Data Compression Portal - Demonstrating various compression algorithms</p>
                            <p className="text-sm mt-2">
                                Supports Huffman Coding, Run-Length Encoding, and LZ77 compression
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </AppContext.Provider>
    );
}

export default App;
