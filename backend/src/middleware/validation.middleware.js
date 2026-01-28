const { validationResult } = require('express-validator');

/**
 * Validation middleware for express-validator
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Debug: Log what's being validated
      console.log('Validation middleware called for:', req.path);
      console.log('Validation rules count:', validations.length);
      
      // Run all validations
      for (const validation of validations) {
        await validation.run(req);
      }
      
      // Check for errors
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        console.log('Validation passed for:', req.path);
        return next();
      }
      
      // Format errors
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
        location: error.location
      }));
      
      console.warn('Validation failed:', {
        path: req.path,
        method: req.method,
        errors: formattedErrors
      });
      
      // Return error response
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
      
    } catch (error) {
      console.error('Validation middleware error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };
};

module.exports = validate;