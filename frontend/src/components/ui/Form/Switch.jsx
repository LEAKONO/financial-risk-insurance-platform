import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const Switch = ({
  checked = false,
  onChange = () => {},
  disabled = false,
  label = '',
  description = '',
  size = 'md',
  variant = 'default',
  showIcons = false,
  className = '',
  id = `switch-${Math.random().toString(36).substr(2, 9)}`,
}) => {
  const variants = {
    default: {
      on: 'bg-blue-600 hover:bg-blue-700',
      off: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600',
    },
    primary: {
      on: 'bg-purple-600 hover:bg-purple-700',
      off: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600',
    },
    success: {
      on: 'bg-green-600 hover:bg-green-700',
      off: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600',
    },
    danger: {
      on: 'bg-red-600 hover:bg-red-700',
      off: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600',
    },
  };

  const sizes = {
    sm: {
      track: 'w-10 h-6',
      thumb: 'w-4 h-4',
      thumbTranslate: 'translate-x-4',
      iconSize: 10,
    },
    md: {
      track: 'w-12 h-7',
      thumb: 'w-5 h-5',
      thumbTranslate: 'translate-x-5',
      iconSize: 12,
    },
    lg: {
      track: 'w-14 h-8',
      thumb: 'w-6 h-6',
      thumbTranslate: 'translate-x-6',
      iconSize: 14,
    },
  };

  const { track, thumb, thumbTranslate, iconSize } = sizes[size];
  const variantStyles = variants[variant];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={`
            relative inline-flex items-center 
            ${track}
            rounded-full
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            ${checked ? variantStyles.on : variantStyles.off}
          `}
        >
          {showIcons && (
            <>
              <div className={`absolute left-1.5 ${checked ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                <X size={iconSize} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className={`absolute right-1.5 ${checked ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                <Check size={iconSize} className="text-white" />
              </div>
            </>
          )}
          
          <motion.span
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            className={`
              absolute
              ${thumb}
              bg-white
              rounded-full
              shadow-md
              flex items-center justify-center
              transition-transform duration-200
              ${checked ? thumbTranslate : 'translate-x-1'}
            `}
          >
            {!showIcons && (
              <span className={`text-xs transition-opacity duration-200 ${checked ? 'opacity-0' : 'opacity-100'}`}>
                {checked ? '✓' : '✕'}
              </span>
            )}
          </motion.span>
        </button>
      </div>

      {(label || description) && (
        <div className="flex flex-col flex-1">
          {label && (
            <label
              htmlFor={id}
              className={`text-sm font-medium ${
                disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
              } cursor-pointer`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`text-xs mt-1 ${
              disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

Switch.displayName = 'Switch';

export default Switch;