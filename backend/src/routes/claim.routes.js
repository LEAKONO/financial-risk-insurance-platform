const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const auth = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createClaimValidator, updateClaimStatusValidator, assignClaimValidator } = require('../validators/claim.validator');
const { upload } = require('../config/cloudinary');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.defaultLimiter);

// All routes require authentication
router.use(auth);

// User claim routes
router.post('/', validate(createClaimValidator), claimController.createClaim);
router.get('/', claimController.getUserClaims);
router.get('/:id', claimController.getClaimById);
router.post('/:id/documents', upload.single('document'), claimController.uploadDocument);
router.delete('/:id/documents/:documentId', claimController.deleteDocument);

// Admin/underwriter routes
router.put('/:id/status', authorize('admin', 'underwriter'), validate(updateClaimStatusValidator), claimController.updateClaimStatus);
router.post('/:id/assign', authorize('admin'), validate(assignClaimValidator), claimController.assignClaim);
router.get('/:id/fraud-analysis', authorize('admin', 'underwriter'), claimController.analyzeFraud);

// Statistics and admin view
router.get('/admin/statistics', authorize('admin', 'underwriter'), claimController.getClaimStatistics);
router.get('/admin/all', authorize('admin', 'underwriter'), claimController.getAdminClaims);

module.exports = router;