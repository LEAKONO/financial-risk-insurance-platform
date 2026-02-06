// frontend/src/components/ui/Button/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  href,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  icon: IconComponent,
  iconPosition = 'left',
  ...props 
}) => {
  // Remove any leftover custom props that shouldn't go to DOM
  const safeProps = { ...props };
  delete safeProps.leftIcon;
  delete safeProps.rightIcon;
  delete safeProps.icon;
  delete safeProps.iconPosition;
  
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 focus:ring-red-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 focus:ring-yellow-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800',
  };
  
  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3.5 text-lg',
    xl: 'px-10 py-4 text-xl',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;
  
  // Determine which icon to render and where
  const renderIcon = () => {
    if (loading) {
      return (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }
    
    // Priority: LeftIcon prop > IconComponent with iconPosition
    if (LeftIcon) {
      const iconSize = size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
      return <LeftIcon className={`${iconSize} mr-2`} />;
    }
    
    if (RightIcon) {
      const iconSize = size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
      return <RightIcon className={`${iconSize} ml-2`} />;
    }
    
    if (IconComponent) {
      const iconSize = size === 'xs' ? 'h-3 w-3' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
      const spacing = children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';
      
      // Handle different icon types
      if (React.isValidElement(IconComponent)) {
        return React.cloneElement(IconComponent, {
          className: `${iconSize} ${spacing} ${IconComponent.props?.className || ''}`
        });
      }
      
      if (typeof IconComponent === 'function') {
        const Icon = IconComponent;
        return <Icon className={`${iconSize} ${spacing}`} />;
      }
    }
    
    return null;
  };
  
  const renderContent = () => {
    const hasLeftIcon = LeftIcon || (IconComponent && iconPosition === 'left');
    const hasRightIcon = RightIcon || (IconComponent && iconPosition === 'right');
    
    return (
      <>
        {(hasLeftIcon || loading) && renderIcon()}
        {children}
        {hasRightIcon && !loading && renderIcon()}
      </>
    );
  };
  
  // Handle href (Link) vs regular button
  if (href) {
    return (
      <Link
        to={href}
        className={buttonClasses}
        onClick={onClick}
        {...safeProps}
      >
        {renderContent()}
      </Link>
    );
  }
  
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      className={buttonClasses}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      {...safeProps}
    >
      {renderContent()}
    </motion.button>
  );
};

// Also export a ButtonGroup component
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${!isFirst ? 'rounded-l-none' : ''} ${!isLast ? 'rounded-r-none border-r-0' : ''}`,
        });
      })}
    </div>
  );
};

// Export Button as both default and named export
export default Button;
export { Button };