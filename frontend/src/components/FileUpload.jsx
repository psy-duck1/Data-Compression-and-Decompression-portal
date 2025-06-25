import React, { useState, useRef } from 'react';
import { Upload, File, X, Cloud } from 'lucide-react';

const FileUpload = ({ onFileSelect, disabled = false, accept = "*/*" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
            : selectedFile
            ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
            : 'border-gray-300 hover:border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-102'} shadow-lg`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          accept={accept}
          disabled={disabled}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 rounded-full p-3">
                <File className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 group"
              disabled={disabled}
            >
              <X className="h-5 w-5 text-red-500 group-hover:text-red-600" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 mx-auto mb-4 w-fit">
              <Cloud className="h-12 w-12 text-blue-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg text-gray-700">
                <span className="font-semibold text-blue-600 hover:text-blue-700">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
