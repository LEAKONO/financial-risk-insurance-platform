import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const UserMenu = ({ isOpen, onClose, user, logout }) => {
  const menuItems = [
    {
      label: 'Profile',
      icon: UserCircleIcon,
      path: '/dashboard/profile',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Settings',
      icon: Cog6ToothIcon,
      path: '/settings',
      color: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Security',
      icon: ShieldCheckIcon,
      path: '/security',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Help Center',
      icon: QuestionMarkCircleIcon,
      path: '/help',
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
        >
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user?.firstName?.[0] || 'U'}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <div className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {user?.role?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color.replace('text', 'bg')}/10`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                </div>
                <span className="font-medium">Logout</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">5</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Policies</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">2</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">78%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Risk Score</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserMenu;