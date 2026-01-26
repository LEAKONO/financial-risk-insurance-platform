const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.adminLimiter);

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// Dashboard and overview
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);

// Policies management
router.get('/policies', adminController.getPolicies);
router.put('/policies/:id/status', adminController.updatePolicyStatus);

// Reports and analytics
router.get('/activity', adminController.getSystemActivity);
router.get('/reports/financial', adminController.getFinancialReport);
router.get('/reports/risk-profiles', adminController.getRiskProfilesOverview);
router.post('/reports/generate', adminController.generateSystemReport);

module.exports = router;