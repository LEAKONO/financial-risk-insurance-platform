const { validationResult } = require('express-validator');

/**
 * Enhanced validation middleware for express-validator
 * Handles all edge cases and provides better error messages
 * 
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Log validation attempt (only in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Validation] ${req.method} ${req.path}`);
      }
      
      // Validate the validations parameter
      if (!validations) {
        console.warn(`[Validation Warning] No validation rules provided for ${req.path}`);
        return next();
      }
      
      if (!Array.isArray(validations)) {
        console.error(`[Validation Error] Validation rules must be an array for ${req.path}`);
        return next(); // Skip validation but continue
      }
      
      if (validations.length === 0) {
        console.warn(`[Validation Warning] Empty validation array for ${req.path}`);
        return next();
      }
      
      // Check if all validation rules are valid
      const invalidRules = validations.filter(v => typeof v !== 'function');
      if (invalidRules.length > 0) {
        console.error(`[Validation Error] ${invalidRules.length} invalid validation rules for ${req.path}`);
        // Continue with valid rules only
      }
      
      // Run all validations
      const validationPromises = validations.map(validation => {
        try {
          return validation.run(req);
        } catch (validationError) {
          console.error(`[Validation Rule Error] ${validationError.message}`);
          return Promise.resolve(); // Continue with other validations
        }
      });
      
      await Promise.all(validationPromises);
      
      // Check for validation errors
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Validation Success] ${req.path}`);
        }
        return next();
      }
      
      // Format errors in a user-friendly way
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
        location: error.location || 'body'
      }));
      
      // Log validation failure
      console.warn(`[Validation Failed] ${req.path}`, {
        method: req.method,
        errors: formattedErrors.map(e => `${e.field}: ${e.message}`)
      });
      
      // Determine if this is a client error (validation) or server error
      const hasValidationErrors = formattedErrors.some(e => 
        e.message.includes('must be') || 
        e.message.includes('required') ||
        e.message.includes('invalid') ||
        e.message.includes('should')
      );
      
      const statusCode = hasValidationErrors ? 400 : 422;
      
      return res.status(statusCode).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
      
    } catch (error) {
      // Handle unexpected errors in the validation middleware
      console.error(`[Validation Middleware Error] ${req.path}:`, error.message);
      console.error('Stack trace:', error.stack);
      
      // In production, we should fail gracefully
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Internal server error during validation'
        });
      }
      
      // In development, provide more details but allow the request to continue
      console.warn(`[Development] Bypassing validation for ${req.path} due to error`);
      return next();
    }
  };
};

/**
 * Simple validation wrapper that doesn't throw on missing validators
 */
const safeValidate = (validations) => {
  if (!validations || !Array.isArray(validations) || validations.length === 0) {
    console.warn(`[Safe Validation] No validations provided, using passthrough`);
    return (req, res, next) => next();
  }
  
  return validate(validations);
};

module.exports = {
  validate,
  safeValidate
};
