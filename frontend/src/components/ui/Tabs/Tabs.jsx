import React, { useState } from 'react';

const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {React.Children.map(children, (child, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === index
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {child.props.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">
        {React.Children.map(children, (child, index) => (
          activeTab === index && child
        ))}
      </div>
    </div>
  );
};

export const Tab = ({ children, label }) => {
  return <div>{children}</div>;
};
export { Tabs }

export default Tabs;
