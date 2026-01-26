const { body } = require('express-validator');

const riskProfileValidator = [
  body('age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  
  body('occupation')
    .isIn(['professional', 'administrative', 'manual', 'hazardous', 'healthcare', 'education', 'technology', 'finance', 'unemployed'])
    .withMessage('Please select a valid occupation'),
  
  body('annualIncome')
    .isFloat({ min: 0 })
    .withMessage('Annual income must be a positive number'),
  
  body('employmentStatus')
    .isIn(['employed', 'self-employed', 'unemployed', 'retired', 'student'])
    .withMessage('Please select a valid employment status'),
  
  body('bmi')
    .optional()
    .isFloat({ min: 10, max: 50 })
    .withMessage('BMI must be between 10 and 50'),
  
  body('smoker')
    .optional()
    .isBoolean()
    .withMessage('Smoker must be true or false'),
  
  body('hasChronicIllness')
    .optional()
    .isBoolean()
    .withMessage('Has chronic illness must be true or false'),
  
  body('hasDangerousHobbies')
    .optional()
    .isBoolean()
    .withMessage('Has dangerous hobbies must be true or false'),
  
  body('creditScore')
    .optional()
    .isInt({ min: 300, max: 850 })
    .withMessage('Credit score must be between 300 and 850'),
  
  body('hasBankruptcyHistory')
    .optional()
    .isBoolean()
    .withMessage('Has bankruptcy history must be true or false'),
  
  body('location.country')
    .optional()
    .isString()
    .withMessage('Country must be a string'),
  
  body('location.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  
  body('location.riskZone')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Risk zone must be low, medium, or high'),
  
  body('hobbies')
    .optional()
    .isArray()
    .withMessage('Hobbies must be an array')
];

const calculatePremiumValidator = [
  body('policyType')
    .isIn(['life', 'health', 'disability', 'property', 'liability', 'auto'])
    .withMessage('Please select a valid policy type'),
  
  body('coverageAmount')
    .isFloat({ min: 1000 })
    .withMessage('Coverage amount must be at least $1,000'),
  
  body('termLength')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Term length must be between 1 and 120 months'),
  
  body('premiumFrequency')
    .optional()
    .isIn(['monthly', 'quarterly', 'semi-annual', 'annual'])
    .withMessage('Premium frequency must be monthly, quarterly, semi-annual, or annual')
];

module.exports = {
  riskProfileValidator,
  calculatePremiumValidator
};