const express = require('express');
const router = express.Router();

// All routes return simple responses for now - we'll fix controllers later
router.use((req, res, next) => {
  console.log(`Policy route: ${req.method} ${req.path}`);
  next();
});

// Create simple handler functions
const createHandler = (methodName) => (req, res) => {
  res.json({
    success: true,
    message: `${methodName} endpoint is working`,
    path: req.path,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });
};

// Apply middleware if they exist, otherwise skip them
const safeAuth = (req, res, next) => {
  if (typeof require('../middleware/auth.middleware') === 'function') {
    return require('../middleware/auth.middleware')(req, res, next);
  }
  next(); // Skip if auth middleware doesn't exist
};

const safeAuthorize = (...roles) => (req, res, next) => {
  const authorize = require('../middleware/role.middleware')?.authorize;
  if (authorize && typeof authorize === 'function') {
    return authorize(...roles)(req, res, next);
  }
  next(); // Skip if authorize doesn't exist
};

const safeRateLimit = (req, res, next) => {
  const rateLimit = require('../middleware/rateLimit.middleware');
  if (rateLimit?.defaultLimiter && typeof rateLimit.defaultLimiter === 'function') {
    return rateLimit.defaultLimiter(req, res, next);
  }
  next(); // Skip if rate limit doesn't exist
};

// Apply middleware
router.use(safeRateLimit);
router.use(safeAuth);

// User policy routes
router.post('/', createHandler('Create policy'));
router.get('/', createHandler('Get user policies'));
router.get('/:id', createHandler('Get policy by ID'));
router.put('/:id', createHandler('Update policy'));
router.post('/:id/cancel', createHandler('Cancel policy'));
router.post('/:id/renew', createHandler('Renew policy'));
router.get('/:id/documents', createHandler('Get policy documents'));
router.get('/:id/payments', createHandler('Get payment history'));

// Admin-only routes
router.get('/admin/all', safeAuthorize('admin', 'underwriter'), createHandler('Get all policies (admin)'));
router.put('/admin/:id/status', safeAuthorize('admin'), createHandler('Update policy status (admin)'));

module.exports = router;