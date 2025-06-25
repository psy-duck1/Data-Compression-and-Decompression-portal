import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorHandler = ({ error, onRetry, onReset }) => {
  if (!error) return null;

  const getErrorType = (errorMessage) => {
    if (errorMessage.includes('File too large')) return 'size';
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) return 'network';
    if (errorMessage.includes('algorithm')) return 'algorithm';
    return 'general';
  };

  const getErrorSuggestion = (errorType) => {
    switch (errorType) {
      case 'size':
        return 'Please select a file smaller than 50MB.';
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'algorithm':
        return 'Please select a valid compression algorithm.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  };

  const errorType = getErrorType(error);
  const suggestion = getErrorSuggestion(errorType);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <p className="text-sm text-red-600 mt-2">{suggestion}</p>
          
          <div className="flex space-x-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </button>
            )}
            
            {onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler;
