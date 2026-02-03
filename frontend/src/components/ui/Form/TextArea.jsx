import React from 'react';

const TextArea = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { TextArea }
export default TextArea
