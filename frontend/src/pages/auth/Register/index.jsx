import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  PhoneIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import RegisterForm from '../../../components/auth/RegisterForm';
import SocialAuth from '../../../components/auth/SocialAuth';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await register(data);
      showToast('Registration successful! Please check your email.', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'AI-powered risk assessment',
    'Instant policy quotes',
    'Fast claims processing',
    '24/7 customer support',
    'Mobile app access',
    'Secure data encryption'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:20px_20px] opacity-10" />
      
      <div className="relative w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Left side - Form */}
          <div className="lg:w-2/3 bg-white dark:bg-gray-800 p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full flex flex-col"
            >
              <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <ArrowRightIcon className="w-5 h-5 rotate-180 mr-2" />
                  Back to home
                </Link>
              </div>
              
              <div className="flex-1">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 mb-4">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Join thousands of satisfied customers
                  </p>
                </div>
                
                <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
                
                <div className="mt-8">
                  <SocialAuth />
                </div>
                
                <div className="mt-8 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right side - Benefits */}
          <div className="lg:w-1/3 bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 -translate-y-48" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 translate-y-48" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 h-full flex flex-col"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Why Join Us?</h2>
                <p className="text-emerald-100">
                  Experience the future of insurance with these exclusive benefits
                </p>
              </div>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-4 h-4" />
                    </div>
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold">$0</div>
                    <div className="text-emerald-100">Start for free</div>
                  </div>
                  <p className="text-sm text-center text-emerald-100">
                    No credit card required. Get started with our free trial.
                  </p>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 180, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 right-12 w-4 h-4 rounded-full bg-white/30"
              />
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-12 left-12 w-6 h-6 rounded-full bg-white/30"
              />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Bottom decorative element */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full mt-8"
        />
      </div>
    </div>
  );
};

export default Register;