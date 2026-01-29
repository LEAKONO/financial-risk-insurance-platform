const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');
const adminController = require('../controllers/admin.controller'); // Add this
const auth = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.defaultLimiter);

// All routes require authentication
router.use(auth);

// User policy routes
router.post('/', policyController.createPolicy);
router.get('/', policyController.getUserPolicies);
router.get('/:id', policyController.getPolicyById);
router.put('/:id', policyController.updatePolicy);
router.post('/:id/cancel', policyController.cancelPolicy);
router.post('/:id/renew', policyController.renewPolicy);
router.get('/:id/documents', policyController.getPolicyDocuments);
router.get('/:id/payments', policyController.getPaymentHistory);

// Admin-only routes - Use adminController.getPolicies
router.get('/admin/all', authorize('admin', 'underwriter'), adminController.getPolicies);
router.put('/admin/:id/status', authorize('admin'), adminController.updatePolicyStatus);

module.exports = router;