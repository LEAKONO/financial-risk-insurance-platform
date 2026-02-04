// frontend/src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar/Sidebar';
import Topbar from './Topbar/Topbar';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🔴 ADMIN LAYOUT RENDERED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Admin Sidebar */}
      <Sidebar 
        isAdmin={true} 
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Wrapper - Properly offset for sidebar */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <Topbar isAdmin={true} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 w-full">
          {/* Admin Header - Clean & Professional */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Admin Dashboard
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-sm font-medium whitespace-nowrap">
                    🛡️ Super Admin
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Full system access • Last login: Today, 09:42 AM
                  </p>
                </div>
              </div>
              
              {/* Admin Stats */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-gray-500 dark:text-gray-400">System Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">All Systems Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subtle Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6"></div>

          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Page Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-4 md:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Admin Footer */}
        <footer className="mt-auto px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-3">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 dark:text-gray-300">RiskGuard Admin</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">v2.0.0</span>
            </div>
            <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-center">
              <span>© {new Date().getFullYear()}</span>
              <span className="hidden md:inline">•</span>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Privacy
              </a>
              <span className="hidden md:inline">•</span>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-full shadow-lg flex items-center justify-center z-40 border border-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
    </div>
  );
};

export default AdminLayout;