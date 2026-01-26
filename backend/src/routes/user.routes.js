const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware'); // SINGLE IMPORT
const { updateProfileValidator } = require('../validators/auth.validator');
const { upload } = require('../config/cloudinary');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.defaultLimiter);

// All routes require authentication
router.use(auth);

// Profile routes
router.get('/me', userController.getProfile);
router.put('/profile', validate(updateProfileValidator), userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.post('/upload-profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture);

// Dashboard and activity
router.get('/dashboard', userController.getDashboard);
router.get('/activity', userController.getActivityLog);

// Account management
router.delete('/account', userController.deleteAccount);

// Admin-only routes
router.get('/', authorize('admin', 'underwriter'), userController.getUsers);
router.get('/:id', authorize('admin', 'underwriter'), userController.getUserById);

module.exports = router;