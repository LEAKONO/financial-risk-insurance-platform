const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { safeValidate } = require('../middleware/validation.middleware');
const { 
  updateProfileValidator, 
  changePasswordValidator,
  deleteAccountValidator 
} = require('../validators/auth.validator');
const { upload } = require('../config/cloudinary');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.defaultLimiter);

// All routes require authentication
router.use(auth);

// ====================
// USER PROFILE ROUTES
// ====================

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', safeValidate(updateProfileValidator), userController.updateProfile);

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', safeValidate(changePasswordValidator), userController.changePassword);

/**
 * @route   POST /api/users/upload-profile-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/upload-profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture);

// ====================
// DASHBOARD & ACTIVITY
// ====================

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', userController.getDashboard);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get('/activity', userController.getActivityLog);

// ====================
// ACCOUNT MANAGEMENT
// ====================

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', safeValidate(deleteAccountValidator), userController.deleteAccount);

// ====================
// ADMIN ROUTES
// ====================

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', authorize('admin', 'underwriter'), userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private (Admin)
 */
router.get('/:id', authorize('admin', 'underwriter'), userController.getUserById);

module.exports = router;
