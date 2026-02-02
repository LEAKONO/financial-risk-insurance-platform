import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import Notifications from './Notifications';
import UserMenu from './UserMenu';

const Topbar = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  const notifications = [
    {
      id: 1,
      title: 'New Claim Submitted',
      message: 'John Doe submitted a new claim',
      time: '2 minutes ago',
      read: false,
      type: 'claim'
    },
    {
      id: 2,
      title: 'Policy Renewal Reminder',
      message: 'Your policy expires in 7 days',
      time: '1 hour ago',
      read: false,
      type: 'policy'
    },
    {
      id: 3,
      title: 'Risk Assessment Updated',
      message: 'Your risk score has been updated',
      time: '3 hours ago',
      read: true,
      type: 'risk'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <motion.div 
            className="hidden md:flex flex-1 max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies, claims, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <motion.div className="relative" whileHover={{ scale: 1.05 }}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <Notifications 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
              />
            </motion.div>

            {/* User Menu */}
            <motion.div className="relative" whileHover={{ scale: 1.05 }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>

                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              <UserMenu 
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                user={user}
                logout={logout}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Topbar;