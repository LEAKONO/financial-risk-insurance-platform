import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarItem from './SidebarItem';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardListIcon, 
  ChartBarIcon, 
  ChartPieIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';

const Sidebar = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/dashboard/policies', label: 'My Policies', icon: DocumentTextIcon },
    { path: '/dashboard/claims', label: 'My Claims', icon: ClipboardListIcon },
    { path: '/dashboard/profile', label: 'Profile', icon: UserGroupIcon },
  ];

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/admin/users', label: 'Users', icon: UserGroupIcon },
    { path: '/admin/policies', label: 'Policies', icon: DocumentTextIcon },
    { path: '/admin/claims', label: 'Claims', icon: ClipboardListIcon },
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
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { x: 0 },
          closed: { x: '-100%' }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 lg:w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl lg:shadow-xl transform transition-all duration-300 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <motion.div
            animate={isCollapsed ? { scale: 0.8, opacity: 0 } : { scale: 1, opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl font-bold">FR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                RiskGuard
              </h1>
              <p className="text-xs text-gray-400">Insurance Portal</p>
            </div>
          </motion.div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-gray-700/50 rounded-lg transition-all"
          >
            <ArrowLeftOnRectangleIcon className={`w-5 h-5 transform transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* User Profile */}
        <motion.div
          animate={isCollapsed ? { opacity: 0 } : { opacity: 1 }}
          className="p-6 border-b border-gray-700/50"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {user?.firstName?.[0] || 'U'}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div>
              <h3 className="font-semibold">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start space-x-3'
            } p-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all group`}
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;