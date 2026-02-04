import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarItem from './SidebarItem';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon, 
  ChartPieIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';

const Sidebar = ({ isAdmin = false, isMobileOpen = false, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/dashboard/policies', label: 'My Policies', icon: DocumentTextIcon },
    { path: '/dashboard/claims', label: 'My Claims', icon: ClipboardDocumentListIcon },
    { path: '/dashboard/profile', label: 'Profile', icon: UserGroupIcon },
  ];

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/admin/users', label: 'Users', icon: UserGroupIcon },
    { path: '/admin/policies', label: 'Policies', icon: DocumentTextIcon },
    { path: '/admin/claims', label: 'Claims', icon: ClipboardDocumentListIcon },
    { path: '/admin/activity', label: 'Activity Log', icon: ChartPieIcon },
    { path: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed positioning */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all"
        >
          <XMarkIcon className="w-6 h-6 text-gray-300" />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <motion.div
            animate={isCollapsed ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
            className={`flex items-center space-x-3 ${isCollapsed ? 'hidden' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold">RG</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                RiskGuard
              </h1>
              <p className="text-xs text-gray-400">Insurance Portal</p>
            </div>
          </motion.div>
          
          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <span className="text-xl font-bold">RG</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-gray-700/50 rounded-lg transition-all ml-auto"
          >
            <ArrowLeftOnRectangleIcon className={`w-5 h-5 transform transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* User Profile */}
        <div className={`p-6 border-b border-gray-700/50 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SidebarItem
                {...item}
                isCollapsed={isCollapsed}
                isActive={location.pathname === item.path}
              />
            </motion.div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50 bg-gray-900">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start space-x-3'
            } p-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all group`}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">Logout</span>
            )}
          </motion.button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;