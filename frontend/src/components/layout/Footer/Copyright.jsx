import React from 'react';

const Copyright = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
      <p className="mb-1">
        © {currentYear} Financial Risk Insurance. All rights reserved.
      </p>
      <p className="text-xs">
        Designed with ❤️ for secure financial futures
      </p>
    </div>
  );
};

export default Copyright;