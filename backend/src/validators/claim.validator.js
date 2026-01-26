const { body } = require('express-validator');
const Policy = require('../models/Policy');

const createClaimValidator = [
  body('policyId')
    .notEmpty()
    .withMessage('Policy ID is required')
    .isMongoId()
    .withMessage('Invalid policy ID')
    .custom(async (policyId, { req }) => {
      const policy = await Policy.findById(policyId);
      
      if (!policy) {
        throw new Error('Policy not found');
      }
      
      if (policy.user.toString() !== req.user._id.toString()) {
        throw new Error('You do not have access to this policy');
      }
      
      if (policy.status !== 'active') {
        throw new Error('Policy must be active to file a claim');
      }
      
      req.policy = policy;
      return true;
    }),
  
  body('type')
    .isIn(['accident', 'illness', 'property-damage', 'theft', 'liability', 'disability', 'death', 'other'])
    .withMessage('Please select a valid claim type'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('incidentDate')
    .isISO8601()
    .withMessage('Please provide a valid incident date')
    .custom((value) => {
      const incidentDate = new Date(value);
      const today = new Date();
      
      if (incidentDate > today) {
        throw new Error('Incident date cannot be in the future');
      }
      
      if (incidentDate < new Date(today.setFullYear(today.getFullYear() - 1))) {
        throw new Error('Incident date cannot be more than 1 year ago');
      }
      
      return true;
    }),
  
  body('claimedAmount')
    .isFloat({ min: 1 })
    .withMessage('Claimed amount must be a positive number')
    .custom((value, { req }) => {
      if (req.policy) {
        const maxCoverage = req.policy.coverage.reduce((sum, cov) => sum + cov.coverageAmount, 0);
        if (value > maxCoverage) {
          throw new Error(`Claimed amount cannot exceed policy coverage of $${maxCoverage}`);
        }
      }
      return true;
    }),
  
  body('documents')
    .optional()
    .isArray()
    .withMessage('Documents must be an array'),
  
  body('documents.*.name')
    .optional()
    .isString()
    .withMessage('Document name must be a string'),
  
  body('documents.*.url')
    .optional()
    .isURL()
    .withMessage('Document URL must be valid')
];

const updateClaimStatusValidator = [
  body('status')
    .isIn(['submitted', 'under-review', 'documentation-required', 'approved', 'rejected', 'paid', 'closed'])
    .withMessage('Please select a valid status'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('approvedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Approved amount must be a positive number'),
  
  body('rejectionReason')
    .optional()
    .isString()
    .withMessage('Rejection reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters')
];

const assignClaimValidator = [
  body('assigneeId')
    .notEmpty()
    .withMessage('Assignee ID is required')
    .isMongoId()
    .withMessage('Invalid assignee ID')
];

module.exports = {
  createClaimValidator,
  updateClaimStatusValidator,
  assignClaimValidator
};