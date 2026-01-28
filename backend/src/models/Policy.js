const mongoose = require('mongoose');

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
    required: true,
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
    type: Number, // in months
    required: true
  },
  
  // Status
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
  strictPopulate: false  // ✅ ADDED THIS LINE
});

// Generate policy number before saving
policySchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  if (!this.policyNumber) {
    const prefix = 'POL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
    this.policyNumber = `${prefix}-${timestamp}-${random}`;
  }
  
  // Calculate end date if not provided
  if (!this.endDate && this.startDate && this.termLength) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.termLength);
    this.endDate = endDate;
  }
  
  next();
});

// Indexes
policySchema.index({ policyNumber: 1 });
policySchema.index({ user: 1 });
policySchema.index({ status: 1 });
policySchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Policy', policySchema);