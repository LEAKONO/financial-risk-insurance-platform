const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quote.controller');
const applicationController = require('../controllers/application.controller');
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');
const rateLimit = require('../middleware/rateLimit.middleware');

// Apply rate limiting to all routes
router.use(rateLimit.defaultLimiter);

// ====================
// PUBLIC ROUTES (No authentication required)
// ====================

/**
 * @route   POST /api/insurance/quote
 * @desc    Get insurance quote (public)
 * @access  Public
 */
router.post('/quote', quoteController.getQuote);

// ====================
// PROTECTED ROUTES (Authentication required)
// ====================
router.use(auth);

/**
 * @route   POST /api/insurance/quote/save
 * @desc    Save quote for logged-in user
 * @access  Private
 */
router.post('/quote/save', quoteController.saveQuote);

/**
 * @route   POST /api/insurance/apply
 * @desc    Submit policy application
 * @access  Private
 */
router.post('/apply', applicationController.submitApplication);

/**
 * @route   GET /api/insurance/applications
 * @desc    Get user's applications
 * @access  Private
 */
router.get('/applications', applicationController.getUserApplications);

/**
 * @route   GET /api/insurance/applications/:applicationId
 * @desc    Get application status
 * @access  Private
 */
router.get('/applications/:applicationId', applicationController.getApplicationStatus);

/**
 * @route   POST /api/insurance/payments/process
 * @desc    Process premium payment
 * @access  Private
 */
router.post('/payments/process', paymentController.processPayment);

/**
 * @route   GET /api/insurance/payments/history
 * @desc    Get payment history
 * @access  Private
 */
router.get('/payments/history', paymentController.getPaymentHistory);

/**
 * @route   POST /api/insurance/payments/methods
 * @desc    Setup payment method
 * @access  Private
 */
router.post('/payments/methods', paymentController.setupPaymentMethod);

module.exports = router;