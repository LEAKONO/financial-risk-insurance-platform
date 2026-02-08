// backend/routes/risk.routes.js
const express = require('express');
const router = express.Router();
const riskController = require('../controllers/risk.controller');
const auth = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { riskProfileValidator, calculatePremiumValidator } = require('../validators/risk.validator');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.defaultLimiter);

// Public routes
router.get('/factors', riskController.getRiskFactors);
router.post('/simulate-premium', riskController.simulatePremium);

// Protected routes
router.use(auth);

// Risk profile routes - FIXED ENDPOINTS
router.post('/profiles', validate(riskProfileValidator), riskController.createOrUpdateRiskProfile);
router.get('/profiles/me', riskController.getRiskProfile);  // ✅ This exists
router.get('/profiles/analysis', riskController.getRiskAnalysis);  // ✅ This exists
router.get('/profiles/compare', riskController.compareWithAverage);  // ✅ This exists

router.post('/calculate-premium', validate(calculatePremiumValidator), riskController.calculatePremium);

// Add these alias endpoints for compatibility
router.get('/profile', riskController.getRiskProfile);  // Alias for /profiles/me
router.get('/analysis', riskController.getRiskAnalysis);  // Alias for /profiles/analysis
router.get('/compare', riskController.compareWithAverage);  // Alias for /profiles/compare

module.exports = router;