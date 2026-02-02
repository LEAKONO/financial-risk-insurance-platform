import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

const ResetPassword = () => {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      showToast('Password reset successful!', 'success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      showToast(error.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthColor = {
    0: 'bg-red-500',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500',
    5: 'bg-emerald-500'
  }[strengthScore];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-10" />
      
      <div className="relative w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white">
            <div className="flex items-center justify-between mb-6">
              <Link to="/login" className="flex items-center text-white/80 hover:text-white">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to login
              </Link>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                <LockClosedIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isSuccess ? 'Password Reset!' : 'Reset Password'}
              </h1>
              <p className="text-indigo-100">
                {isSuccess 
                  ? 'Your password has been updated' 
                  : 'Create a new secure password'}
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Success!
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been successfully reset. You will be redirected to the login page shortly.
                </p>
                
                <div className="animate-pulse">
                  <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Redirecting to login...
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password strength */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Password strength:
                        </span>
                        <span className="text-sm font-medium">
                          {strengthScore}/5
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${strengthScore * 20}%` }}
                          className={`h-full ${strengthColor} transition-all`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label: '8+ characters', check: passwordStrength.length },
                          { label: 'Uppercase', check: passwordStrength.uppercase },
                          { label: 'Lowercase', check: passwordStrength.lowercase },
                          { label: 'Number', check: passwordStrength.number },
                          { label: 'Special char', check: passwordStrength.special },
                        ].map((req, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              req.check ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`} />
                            <span className={req.check ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Passwords do not match
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || password !== confirmPassword}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600" />
                  )}
                </motion.button>
                
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Back to login
                  </Link>
                </div>
              </motion.form>
            )}
          </div>
          
          {/* Security note */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>256-bit SSL encryption</span>
            </div>
          </div>
        </motion.div>
        
        {/* Floating decorative element */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full border-4 border-indigo-200/30 dark:border-indigo-700/30 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default ResetPassword;