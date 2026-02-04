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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Admin Sidebar - isAdmin is TRUE */}
      <Sidebar 
        isAdmin={true} 
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar isAdmin={true} />

        {/* Main Content Area */}
        <main className="p-4 md:p-6">
          {/* Admin Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <span className="mr-3">🛡️</span>
                  Admin Control Panel
                </h1>
                <p className="text-red-100">
                  Manage users, policies, claims, and system settings
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

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

        {/* Admin Footer */}
        <footer className="mt-12 p-6 border-t border-slate-700/50 bg-slate-900/50">
          <div className="text-center text-gray-400 text-sm">
            <p className="font-semibold text-gray-300">
              🛡️ RiskGuard Admin Portal
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Financial Risk Insurance
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Version 2.0.0 • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </footer>
      </div>

      {/* Floating Action Button for Mobile - Red theme for admin */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
    </div>
  );
};

export default AdminLayout;