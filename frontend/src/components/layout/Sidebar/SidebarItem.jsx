import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SidebarItem = ({ path, label, icon: Icon, isActive, isCollapsed }) => {
  return (
    <Link to={path}>
      <motion.div
        whileHover={{ x: 10 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center p-3 rounded-xl transition-all group relative ${
          isActive
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
          />
        )}

        <div className="relative">
          <Icon className={`w-6 h-6 ${isCollapsed ? 'mx-auto' : ''}`} />
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {!isCollapsed && (
          <>
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              className="ml-3 font-medium"
            >
              {label}
            </motion.span>
            
            {/* Hover glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            />
          </>
        )}
      </motion.div>
    </Link>
  );
};

export default SidebarItem;