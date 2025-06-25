import React, { useState } from 'react';
import { Download, FileText, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';

const FileDownload = ({ filename, type, originalFilename }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      const blob = await ApiService.downloadFile(type, filename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFilename || filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {originalFilename || filename}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {type} file ready for download
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileDownload;
