const { validationResult } = require('express-validator');

/**
 * Validation middleware for express-validator
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      // Check for errors
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        return next();
      }
      
      // Format errors
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
        location: error.location
      }));
      
      // Log validation errors (optional)
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
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };
};

module.exports = validate; // Export as a single function