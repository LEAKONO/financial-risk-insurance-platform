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

// ⭐ MAIN ENDPOINTS (Use these)
router.post('/profile', validate(riskProfileValidator), riskController.createOrUpdateRiskProfile);
router.get('/profile', riskController.getRiskProfile);
router.get('/analysis', riskController.getRiskAnalysis);
router.get('/compare', riskController.compareWithAverage);
router.post('/calculate-premium', validate(calculatePremiumValidator), riskController.calculatePremium);

// Legacy/compatibility endpoints (optional)
router.post('/profiles', validate(riskProfileValidator), riskController.createOrUpdateRiskProfile); // Alias
router.get('/profiles/me', riskController.getRiskProfile); // Alias
router.get('/profiles/analysis', riskController.getRiskAnalysis); // Alias
router.get('/profiles/compare', riskController.compareWithAverage); // Alias

module.exports = router;