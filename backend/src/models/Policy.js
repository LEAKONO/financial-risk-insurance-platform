const mongoose = require('mongoose');

// Beneficiary Schema
const beneficiarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    enum: ['spouse', 'child', 'parent', 'sibling', 'other'],
    default: 'other'
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
});

const coverageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['life', 'health', 'disability', 'property', 'liability', 'auto'],
    required: true
  },
  coverageAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deductible: {
    type: Number,
    min: 0
  },
  maxLimit: Number,
  description: String
});

const premiumScheduleSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'semi-annual', 'annual'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: Date,
  paid: {
    type: Boolean,
    default: false
  },
  paidDate: Date
});

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riskProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskProfile',
    required: true
  },
  
  // Policy Details
  name: {
    type: String,
    required: true
  },
  description: String,
  coverage: [coverageSchema],
  
  // Beneficiaries
  beneficiaries: [beneficiarySchema],
  
  // Premium Information
  basePremium: {
    type: Number,
    required: true,
    min: 0
  },
  totalPremium: {
    type: Number,
    required: true,
    min: 0
  },
  premiumSchedule: [premiumScheduleSchema],
  
  // Policy Terms
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: Date,
  termLength: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'cancelled', 'lapsed'],
    default: 'active'
  },
  
  // Risk Calculations
  riskMultiplier: {
    type: Number,
    min: 0.5,
    max: 3.0,
    default: 1.0
  },
  
  // Claims
  totalClaims: {
    type: Number,
    default: 0
  },
  totalClaimAmount: {
    type: Number,
    default: 0
  },
  
  // Audit
  underwrittenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  underwrittenDate: Date,
  
  // Renewal
  isAutoRenewable: {
    type: Boolean,
    default: true
  },
  renewalDate: Date
}, {
  timestamps: true,
  strictPopulate: false
});

// Generate policy number before saving - FIXED VERSION
policySchema.pre('save', async function() {
  console.log('=== PRE-SAVE HOOK START ===');
  console.log('isNew:', this.isNew);
  console.log('Current policyNumber:', this.policyNumber);
  console.log('Current name:', this.name);
  console.log('Beneficiaries:', this.beneficiaries ? this.beneficiaries.length : 0);
  
  // Only generate for new documents
  if (!this.isNew) {
    console.log('Not a new document, skipping generation');
    return;
  }
  
  // Generate policy number if it doesn't exist
  if (!this.policyNumber) {
    const prefix = 'POL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
    this.policyNumber = `${prefix}-${timestamp}-${random}`;
    console.log('Generated policyNumber:', this.policyNumber);
  }
  
  // Set default name if not provided
  if (!this.name && this.coverage && this.coverage.length > 0 && this.coverage[0].type) {
    this.name = `${this.coverage[0].type} Insurance Policy`;
    console.log('Set default name:', this.name);
  }
  
  // Calculate end date if not provided
  if (!this.endDate && this.startDate && this.termLength) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.termLength);
    this.endDate = endDate;
    console.log('Set end date:', this.endDate);
  }
  
  // Validate beneficiaries percentages if present
  if (this.beneficiaries && this.beneficiaries.length > 0) {
    const totalPercentage = this.beneficiaries.reduce((sum, beneficiary) => {
      return sum + (beneficiary.percentage || 0);
    }, 0);
    
    console.log('Beneficiaries total percentage:', totalPercentage);
    
    // Only validate for new policies or when beneficiaries are explicitly set
    if (totalPercentage !== 100 && this.isModified('beneficiaries')) {
      console.warn('Warning: Beneficiaries percentages total', totalPercentage, 'instead of 100');
    }
  }
  
  console.log('=== PRE-SAVE HOOK END ===');
});

// Validate beneficiaries percentages (only on save)
policySchema.pre('save', function(next) {
  if (this.beneficiaries && this.beneficiaries.length > 0 && this.isModified('beneficiaries')) {
    const totalPercentage = this.beneficiaries.reduce((sum, beneficiary) => {
      return sum + (beneficiary.percentage || 0);
    }, 0);
    
    if (totalPercentage !== 100) {
      const err = new Error('Beneficiaries percentages must total 100%');
      err.code = 'BENEFICIARY_PERCENTAGE_ERROR';
      return next(err);
    }
  }
  next();
});

// Indexes
policySchema.index({ policyNumber: 1 });
policySchema.index({ user: 1 });
policySchema.index({ status: 1 });
policySchema.index({ startDate: 1, endDate: 1 });
policySchema.index({ 'beneficiaries.name': 1 }); // Index for beneficiary search

// Virtual for total beneficiaries percentage
policySchema.virtual('totalBeneficiaryPercentage').get(function() {
  if (!this.beneficiaries || this.beneficiaries.length === 0) {
    return 0;
  }
  return this.beneficiaries.reduce((sum, beneficiary) => sum + (beneficiary.percentage || 0), 0);
});

// Method to add beneficiary
policySchema.methods.addBeneficiary = function(beneficiary) {
  this.beneficiaries.push(beneficiary);
  return this.save();
};

// Method to remove beneficiary
policySchema.methods.removeBeneficiary = function(beneficiaryId) {
  this.beneficiaries = this.beneficiaries.filter(b => b._id.toString() !== beneficiaryId);
  return this.save();
};

// Method to update beneficiary
policySchema.methods.updateBeneficiary = function(beneficiaryId, updates) {
  const beneficiary = this.beneficiaries.id(beneficiaryId);
  if (beneficiary) {
    Object.assign(beneficiary, updates);
  }
  return this.save();
};

module.exports = mongoose.model('Policy', policySchema);