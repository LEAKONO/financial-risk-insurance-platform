import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, X, FileText, Image as ImageIcon,
  File, CheckCircle, AlertCircle, Trash2,
  Eye, Download, Loader2, CloudUpload,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Progress } from '@/components/ui/Progress/Progress';
import { useToast } from '@/hooks/useToast';
import { claimService } from '@/services/api';

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

export const DocumentUpload = ({ claimId, requiredDocuments = [], onComplete, onCancel }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const { showToast } = useToast();

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type === 'application/pdf') return FileText;
    if (file.type.includes('word') || file.type.includes('document')) return FileText;
    return File;
  };

  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File "${file.name}" exceeds maximum size of 10MB`);
    }

    // Check file type
    const isValidType = Object.keys(ACCEPTED_TYPES).some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      return file.type === type;
    });

    if (!isValidType) {
      errors.push(`File "${file.name}" has an unsupported type. Accepted types: Images, PDF, Word documents, Text files`);
    }

    // Check total size
    const totalSize = [...files, file].reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(`Total size exceeds maximum limit of 50MB`);
    }

    return errors;
  };

  const handleFileChange = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(...fileErrors);
      }
    });

    if (errors.length > 0) {
      showToast('error', errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      showToast('success', `Added ${validFiles.length} file(s)`);
    }
  }, [files]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [handleFileChange]);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file, index) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('claimId', claimId);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);

      claimService.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(prev => ({
            ...prev,
            [index]: percentCompleted
          }));
        }
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showToast('error', 'Please select files to upload');
      return;
    }

    setUploading(true);
    const results = [];
    const errors = [];

    try {
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await uploadFile(files[i], i);
          results.push(result);
        } catch (error) {
          errors.push({ file: files[i].name, error: error.message });
        }
      }

      if (errors.length > 0) {
        showToast('warning', `Uploaded ${results.length} files, failed ${errors.length}`);
      } else {
        showToast('success', `Successfully uploaded ${files.length} files`);
        onComplete?.(results);
      }
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  const getTotalSize = () => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes < 1024) return `${totalBytes} bytes`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload supporting documents for claim #{claimId?.slice(-8)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={uploading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Required Documents */}
      {requiredDocuments.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Required Documents
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Please upload the following documents to continue processing your claim:
              </p>
              <ul className="space-y-2">
                {requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Area */}
      <Card className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept={Object.keys(ACCEPTED_TYPES).join(',')}
            onChange={(e) => handleFileChange(e.target.files)}
            className="hidden"
          />
          
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudUpload className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Drag & drop files here
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              or click to browse files on your computer
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>Supports: Images, PDF, Word documents</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Max file size: 10MB • Total limit: 50MB</span>
              </div>
            </div>

            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Selected Files ({files.length})
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total size: {getTotalSize()}
              </div>
            </div>

            <div className="space-y-3">
              {files.map((file, index) => {
                const Icon = getFileIcon(file);
                const previewUrl = getFilePreview(file);
                const fileProgress = progress[index] || 0;
                const isUploading = uploading && fileProgress < 100;
                const isComplete = fileProgress === 100;

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    {/* File Icon/Preview */}
                    <div className="relative">
                      {previewUrl ? (
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      
                      {isComplete && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          {previewUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(previewUrl, '_blank')}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • {file.type}
                        </span>
                        <span className={`font-medium ${
                          isUploading ? 'text-blue-600' :
                          isComplete ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {isUploading ? `${fileProgress}%` : 'Ready'}
                        </span>
                      </div>

                      {isUploading && (
                        <Progress
                          value={fileProgress}
                          className="h-1 mt-2"
                          color={fileProgress === 100 ? 'green' : 'blue'}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Upload Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Tips for Better Uploads
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Use clear, high-quality images</li>
                <li>• Ensure all text in documents is readable</li>
                <li>• Upload documents in chronological order</li>
                <li>• Include date and reference numbers when available</li>
                <li>• Compress large files before uploading</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Progress Summary */}
      {uploading && Object.keys(progress).length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Upload Progress
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.round(
                  Object.values(progress).reduce((a, b) => a + b, 0) /
                  Object.keys(progress).length
                )}%
              </span>
            </div>
            
            <Progress
              value={Math.round(
                Object.values(progress).reduce((a, b) => a + b, 0) /
                Object.keys(progress).length
              )}
              className="h-2"
            />
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Uploading {files.length} files • Please don't close this window
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};export default DocumentUpload;
