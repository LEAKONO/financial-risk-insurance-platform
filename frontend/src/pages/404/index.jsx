import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  SearchIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-10" />
          
          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 mb-8"
              >
                <ExclamationTriangleIcon className="w-16 h-16 text-red-600 dark:text-red-400" />
              </motion.div>

              {/* Error code */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="text-9xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  404
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                  Page Not Found
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  Oops! The page you're looking for seems to have wandered off into the digital wilderness.
                </p>
              </motion.div>

              {/* Search suggestion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="max-w-md mx-auto">
                  <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-2xl mb-4">
                    <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Couldn't find what you were looking for?
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        Try searching our site
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Here are some helpful links instead:
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { label: 'Dashboard', path: '/dashboard', icon: HomeIcon },
                    { label: 'Home', path: '/', icon: ArrowLeftIcon },
                    { label: 'Policies', path: '/dashboard/policies', icon: ShieldCheckIcon },
                    { label: 'Claims', path: '/dashboard/claims', icon: ShieldCheckIcon },
                    { label: 'Risk Assessment', path: '/risk-assessment', icon: ShieldCheckIcon },
                  ].map((link, index) => (
                    <Link
                      key={link.path}
                      to={link.path}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all"
                      >
                        <link.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {link.label}
                        </span>
                      </motion.button>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Main action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Return to Homepage</span>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Contact support */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Still having trouble?{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Contact our support team
                  </a>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-8 right-8 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute bottom-8 left-8 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          {[
            { label: 'Active Users', value: '2,847' },
            { label: 'Total Policies', value: '15,234' },
            { label: 'Claims Processed', value: '3,142' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;