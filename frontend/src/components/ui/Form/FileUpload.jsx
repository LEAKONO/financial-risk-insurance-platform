// frontend/src/components/ui/Form/FileUpload.jsx
import React, { useState } from 'react'
import { Upload, X, File, CheckCircle } from 'lucide-react'

const FileUpload = ({
  label,
  accept,
  multiple = false,
  value = [],
  onChange,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  error,
  className = '',
}) => {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds maximum size of ${maxSize / (1024 * 1024)}MB`)
        return false
      }
      return true
    })

    if (multiple) {
      onChange([...value, ...validFiles])
    } else {
      onChange(validFiles[0] || null)
    }
  }

  const removeFile = (index) => {
    if (multiple) {
      const newFiles = [...value]
      newFiles.splice(index, 1)
      onChange(newFiles)
    } else {
      onChange(null)
    }
  }

  const fileList = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-upload').click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 mb-2">
          Drag & drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Max file size: {maxSize / (1024 * 1024)}MB
        </p>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {fileList.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileList.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export { FileUpload }
export default FileUpload