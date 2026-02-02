import React from 'react';
import { motion } from 'framer-motion';

const SocialAuth = ({ 
  onGoogleAuth, 
  onFacebookAuth, 
  onGithubAuth,
  onLinkedInAuth,
  loading = false 
}) => {
  const socialButtons = [
    {
      provider: 'google',
      label: 'Google',
      color: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70497C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
            fill="#EA4335"
          />
          <path
            fill="currentColor"
            d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
            fill="#4285F4"
          />
          <path
            fill="currentColor"
            d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.2749 6.60986C0.464904 8.22986 0 10.0599 0 11.9999C0 13.9399 0.464904 15.7699 1.2749 17.3899L5.26498 14.2949Z"
            fill="#FBBC05"
          />
          <path
            fill="currentColor"
            d="M12.0001 24C15.2401 24 17.9651 22.935 19.9451 21.095L16.0801 18.095C15.0051 18.82 13.6201 19.25 12.0001 19.25C8.87005 19.25 6.21507 17.14 5.26507 14.295L1.27502 17.39C3.25502 21.31 7.31002 24 12.0001 24Z"
            fill="#34A853"
          />
        </svg>
      ),
      onClick: onGoogleAuth,
    },
    {
      provider: 'facebook',
      label: 'Facebook',
      color: 'bg-[#1877F2] border-[#1877F2] text-white hover:bg-[#166FE5]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
      onClick: onFacebookAuth,
    },
    {
      provider: 'github',
      label: 'GitHub',
      color: 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800 dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
      onClick: onGithubAuth,
    },
    {
      provider: 'linkedin',
      label: 'LinkedIn',
      color: 'bg-[#0A66C2] border-[#0A66C2] text-white hover:bg-[#004182]',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
        </svg>
      ),
      onClick: onLinkedInAuth,
    },
  ];

  const handleSocialAuth = (provider) => {
    const button = socialButtons.find(btn => btn.provider === provider);
    if (button && button.onClick) {
      button.onClick();
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {socialButtons.map((button) => (
          <motion.button
            key={button.provider}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={loading}
            onClick={() => handleSocialAuth(button.provider)}
            className={`w-full inline-flex justify-center items-center py-3 px-4 border rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${button.color}`}
          >
            {button.icon}
            <span className="ml-2">{button.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms
          </button>{' '}
          and{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default SocialAuth;