import React from 'react';
import { AlertTriangle, X, RefreshCw, Home, Info } from 'lucide-react';

const ErrorHandler = ({ error, onClose, onRetry, onReset }) => {
    if (!error) return null;

    const getErrorIcon = (code) => {
        switch (code) {
            case 'FILE_TOO_LARGE':
            case 'FILE_TOO_SMALL':
            case 'FILE_EMPTY':
                return '📁';
            case 'COMPRESSION_FAILED':
            case 'DECOMPRESSION_FAILED':
                return '⚙️';
            case 'UPLOAD_FAILED':
            case 'DOWNLOAD_FAILED':
                return '🌐';
            default:
                return '⚠️';
        }
    };

    const getErrorColor = (code) => {
        if (code?.includes('FAILED')) return 'red';
        if (code?.includes('FILE_')) return 'yellow';
        return 'red';
    };

    const getSuggestions = (code) => {
        switch (code) {
            case 'FILE_TOO_LARGE':
                return [
                    'Try compressing the file with another tool first',
                    'Split large files into smaller chunks',
                    'Use a file under 50MB'
                ];
            case 'FILE_TOO_SMALL':
            case 'FILE_EMPTY':
                return [
                    'Select a file with actual content',
                    'Check if the file was corrupted during transfer'
                ];
            case 'COMPRESSION_FAILED':
                return [
                    'Try a different compression algorithm',
                    'Check if the file is corrupted',
                    'Ensure the file is not already compressed'
                ];
            case 'DECOMPRESSION_FAILED':
                return [
                    'Ensure the compressed file is not corrupted',
                    'Try compressing and decompressing again',
                    'Check if you selected the correct algorithm'
                ];
            case 'UPLOAD_FAILED':
                return [
                    'Check your internet connection',
                    'Try uploading again',
                    'Ensure the file is not in use by another program'
                ];
            case 'DOWNLOAD_FAILED':
                return [
                    'Check your internet connection',
                    'Try downloading again',
                    'Clear your browser cache'
                ];
            default:
                return [
                    'Try refreshing the page',
                    'Check your internet connection',
                    'Contact support if the problem persists'
                ];
        }
    };

    
    const getErrorSeverity = (code) => {
        const criticalErrors = ['COMPRESSION_FAILED', 'DECOMPRESSION_FAILED', 'UPLOAD_FAILED'];
        const warningErrors = ['FILE_TOO_LARGE', 'FILE_TOO_SMALL', 'FILE_EMPTY'];
        
        if (criticalErrors.includes(code)) return 'critical';
        if (warningErrors.includes(code)) return 'warning';
        return 'error';
    };

    const colorClasses = {
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            button: 'bg-red-100 hover:bg-red-200 text-red-800',
            icon: 'text-red-500'
        },
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
            icon: 'text-yellow-500'
        }
    };

    const color = getErrorColor(error.code);
    const classes = colorClasses[color];
    const severity = getErrorSeverity(error.code);
    const suggestions = getSuggestions(error.code);

    return (
        <div className={`${classes.bg} ${classes.border} border rounded-lg p-6 mb-6 animate-fade-in`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className={`w-6 h-6 ${classes.icon}`} />
                </div>
                
                <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${classes.text}`}>
                            {getErrorIcon(error.code)} Error Occurred
                        </h3>
                        <button
                            onClick={onClose}
                            className={`${classes.button} p-1 rounded-full transition-colors`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className={`mt-2 text-sm ${classes.text}`}>
                        <p className="font-medium mb-2">
                            {error.code}: {error.message}
                        </p>
                        
                        {}
                        {severity === 'critical' && (
                            <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-md">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Info className="w-4 h-4" />
                                    <span className="font-medium">Critical Error Details:</span>
                                </div>
                                <p className="text-xs">
                                    This error prevents the operation from completing. Please try the suggested solutions below.
                                </p>
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <p className="font-medium mb-2">Suggested solutions:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className={`${classes.button} px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1`}
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Try Again</span>
                            </button>
                        )}
                        
                        {onReset && (
                            <button
                                onClick={onReset}
                                className={`${classes.button} px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1`}
                            >
                                <Home className="w-3 h-3" />
                                <span>Start Over</span>
                            </button>
                        )}
                        
                        <button
                            onClick={onClose}
                            className={`${classes.button} px-3 py-1 rounded-md text-sm font-medium transition-colors`}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorHandler;
