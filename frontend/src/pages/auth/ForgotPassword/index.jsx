import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      showToast('Password reset link sent to your email', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to send reset link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-10" />
      
      <div className="relative w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white">
            <div className="flex items-center justify-between mb-6">
              <Link to="/login" className="flex items-center text-white/80 hover:text-white">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to login
              </Link>
              <Link to="/" className="text-white/80 hover:text-white">
                <ArrowRightIcon className="w-5 h-5 rotate-180" />
              </Link>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
              </h1>
              <p className="text-orange-100">
                {isSubmitted 
                  ? 'We sent you a reset link' 
                  : 'Enter your email to reset your password'}
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Reset Link Sent!
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We've sent password reset instructions to{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>.
                  Please check your email and follow the link to reset your password.
                </p>
                
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      try again
                    </button>
                  </div>
                  
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Return to Login
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Enter the email address associated with your account
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600" />
                  )}
                </motion.button>
                
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </motion.form>
            )}
          </div>
          
          {/* Security note */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Your information is securely encrypted
            </div>
          </div>
        </motion.div>
        
        {/* Floating decorative element */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full border-4 border-orange-200/30 dark:border-orange-700/30 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;