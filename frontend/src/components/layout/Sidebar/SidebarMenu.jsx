import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SidebarMenu = ({ isCollapsed = false }) => {
  const { user } = useAuth();
  const [theme, setTheme] = React.useState('dark');

  const menuItems = [
    {
      label: 'Notifications',
      icon: BellIcon,
      onClick: () => console.log('Notifications'),
      badge: 3,
    },
    {
      label: 'Settings',
      icon: Cog6ToothIcon,
      onClick: () => console.log('Settings'),
      badge: null,
    },
    {
      label: 'Help Center',
      icon: QuestionMarkCircleIcon,
      onClick: () => console.log('Help'),
      badge: null,
    },
    {
      label: 'Security',
      icon: ShieldCheckIcon,
      onClick: () => console.log('Security'),
      badge: null,
    },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="space-y-2">
      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`w-full flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-start space-x-3'
        } p-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all group`}
      >
        {theme === 'dark' ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
        {!isCollapsed && (
          <span className="font-medium">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </motion.button>

      {/* User Role Badge */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Account Status</p>
              <p className="text-sm font-medium mt-1">
                {user?.isEmailVerified ? 'Verified' : 'Pending'}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-2 mt-4"
        >
          {menuItems.slice(0, 2).map((item, index) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={item.onClick}
              className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all group relative"
            >
              <item.icon className="w-4 h-4 text-gray-300 group-hover:text-white mx-auto" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SidebarMenu;