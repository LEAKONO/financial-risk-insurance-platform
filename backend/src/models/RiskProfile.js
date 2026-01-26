const mongoose = require('mongoose');

const riskFactorSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['occupation', 'health', 'lifestyle', 'financial', 'geographic'],
    required: true
  },
  factor: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['low', 'medium', 'high', 'very-high'],
    required: true
  },
  multiplier: {
    type: Number,
    required: true,
    min: 0.5,
    max: 3.0
  }
});

const riskProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  occupation: {
    type: String,
    required: true,
    enum: [
      'professional', 'administrative', 'manual', 'hazardous', 
      'healthcare', 'education', 'technology', 'finance', 'unemployed'
    ]
  },
  annualIncome: {
    type: Number,
    required: true,
    min: 0
  },
  employmentStatus: {
    type: String,
    enum: ['employed', 'self-employed', 'unemployed', 'retired', 'student'],
    required: true
  },
  
  // Health Information
  hasChronicIllness: {
    type: Boolean,
    default: false
  },
  smoker: {
    type: Boolean,
    default: false
  },
  bmi: {
    type: Number,
    min: 10,
    max: 50
  },
  
  // Lifestyle
  hasDangerousHobbies: {
    type: Boolean,
    default: false
  },
  hobbies: [String],
  
  // Financial
  creditScore: {
    type: Number,
    min: 300,
    max: 850
  },
  hasBankruptcyHistory: {
    type: Boolean,
    default: false
  },
  
  // Geographic
  location: {
    country: String,
    city: String,
    riskZone: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // Calculated Fields
  riskFactors: [riskFactorSchema],
  overallRiskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  riskCategory: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very-high'],
    default: 'moderate'
  },
  basePremiumMultiplier: {
    type: Number,
    min: 0.5,
    max: 3.0,
    default: 1.0
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
riskProfileSchema.index({ user: 1 });
riskProfileSchema.index({ overallRiskScore: 1 });
riskProfileSchema.index({ riskCategory: 1 });

module.exports = mongoose.model('RiskProfile', riskProfileSchema);