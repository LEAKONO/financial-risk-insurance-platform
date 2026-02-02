import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar/Sidebar';
import Topbar from './Topbar/Topbar';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <Sidebar 
        isAdmin={true} 
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar />

        {/* Main Content Area */}
        <main className="p-4 md:p-6">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Page Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-12 p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>Financial Risk Insurance Admin Portal © {new Date().getFullYear()}</p>
            <p className="mt-1 text-xs">
              Version 2.0.0 • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </footer>
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
    </div>
  );
};

export default AdminLayout;