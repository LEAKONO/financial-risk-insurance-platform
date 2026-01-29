const { body, param, query } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
    .notEmpty()
    .withMessage('Email is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('First name is required'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('Last name is required'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please enter a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
      
      return true;
    })
    .notEmpty()
    .withMessage('Date of birth is required'),
  
  body('phone')
    .trim()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Please enter a valid phone number')
    .notEmpty()
    .withMessage('Phone number is required')
];

const loginValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
    .notEmpty()
    .withMessage('Email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
    .notEmpty()
    .withMessage('Email is required')
];

const resetPasswordValidator = [
  param('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
/**
 * Validation rules for updating user profile
 */
const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isString().withMessage('First name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isString().withMessage('Last name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isString().withMessage('Phone must be a string')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please enter a valid phone number (E.164 format)'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom(value => {
      const dob = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const hasBirthdayOccurred = today.getMonth() > dob.getMonth() || 
                                 (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
      const adjustedAge = hasBirthdayOccurred ? age : age - 1;
      
      if (adjustedAge < 18) throw new Error('Must be at least 18 years old');
      if (adjustedAge > 120) throw new Error('Please enter a valid date of birth');
      return true;
    })
];

/**
 * Validation rules for changing password
 */
const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain uppercase, lowercase, and number')
    .notEmpty().withMessage('New password is required')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Validation rules for deleting account
 */
const deleteAccountValidator = [
  body('password')
    .notEmpty().withMessage('Password is required to delete account')
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,      // NEW: Added this
  changePasswordValidator,     // NEW: Added this
  deleteAccountValidator       // NEW: Added this
};
