// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting for admin routes
router.use(rateLimit.adminLimiter);

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// ============================================
// DASHBOARD & OVERVIEW
// ============================================
router.get('/dashboard', adminController.getDashboard);

// ============================================
// USER MANAGEMENT
// ============================================
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.toggleUserStatus);

// ============================================
// POLICY MANAGEMENT
// ============================================
router.get('/policies', adminController.getPolicies);
router.put('/policies/:id/status', adminController.updatePolicyStatus);

// ============================================
// ACTIVITY & MONITORING
// ============================================
router.get('/activity', adminController.getSystemActivity); // Full activity log with pagination
router.get('/activities/recent', adminController.getRecentActivity); // Recent activities for dashboard

// ============================================
// REPORTS & ANALYTICS
// ============================================
router.get('/reports/financial', adminController.getFinancialReport);
router.get('/reports/risk-profiles', adminController.getRiskProfilesOverview);
router.post('/reports/generate', adminController.generateSystemReport);

// ============================================
// SYSTEM MANAGEMENT
// ============================================
// Add more system management routes here as needed

module.exports = router;