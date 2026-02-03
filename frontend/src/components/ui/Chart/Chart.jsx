import React from 'react';

const Chart = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div className="h-64 flex items-center justify-center">
        {children || (
          <div className="text-center text-gray-400">
            Chart visualization will be implemented here
          </div>
        )}
      </div>
    </div>
  );
};
export { Chart }

export default Chart;
