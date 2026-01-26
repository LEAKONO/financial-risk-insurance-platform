const express = require('express');
const router = express.Router();
const riskController = require('../controllers/risk.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');const { riskProfileValidator, calculatePremiumValidator } = require('../validators/risk.validator');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting
router.use(rateLimit.defaultLimiter);

// Public routes
router.get('/factors', riskController.getRiskFactors);
router.post('/simulate-premium', riskController.simulatePremium);

// Protected routes
router.use(auth);

// Risk profile routes
router.post('/profiles', validate(riskProfileValidator), riskController.createOrUpdateRiskProfile);
router.get('/profiles/me', riskController.getRiskProfile);
router.get('/profiles/analysis', riskController.getRiskAnalysis);
router.get('/profiles/compare', riskController.compareWithAverage);

// Premium calculation
router.post('/calculate-premium', validate(calculatePremiumValidator), riskController.calculatePremium);

module.exports = router;