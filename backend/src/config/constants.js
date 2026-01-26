module.exports = {
  // Risk Calculation Constants
  RISK_MULTIPLIERS: {
    AGE: {
      '18-25': 1.2,
      '26-40': 1.0,
      '41-55': 1.1,
      '56-65': 1.3,
      '66+': 1.5
    },
    OCCUPATION: {
      'professional': 0.9,
      'administrative': 1.0,
      'manual': 1.2,
      'hazardous': 1.8,
      'healthcare': 1.1,
      'education': 0.9,
      'technology': 0.8,
      'finance': 0.9,
      'unemployed': 1.3
    },
    INCOME: {
      '0-30000': 1.3,
      '30001-60000': 1.1,
      '60001-100000': 1.0,
      '100001-200000': 0.9,
      '200001+': 0.8
    },
    HEALTH: {
      'excellent': 0.8,
      'good': 1.0,
      'average': 1.2,
      'poor': 1.5
    }
  },
  
  // Policy Constants
  POLICY_TYPES: {
    LIFE: {
      basePremium: 100,
      coverageMultiplier: 0.001 // $1 per $1000 coverage
    },
    HEALTH: {
      basePremium: 150,
      coverageMultiplier: 0.002
    },
    DISABILITY: {
      basePremium: 75,
      coverageMultiplier: 0.0005
    },
    PROPERTY: {
      basePremium: 200,
      coverageMultiplier: 0.0003
    }
  },
  
  // Claim Constants
  CLAIM_STATUS: {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under-review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PAID: 'paid',
    CLOSED: 'closed'
  },
  
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    UNDERWRITER: 'underwriter',
    CUSTOMER: 'customer'
  },
  
  // JWT
  JWT_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  }
};