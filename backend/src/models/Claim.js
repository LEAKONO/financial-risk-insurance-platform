const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: false,
    unique: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Claim Details
  type: {
    type: String,
    enum: [
      'accident', 'illness', 'property-damage', 'theft', 
      'liability', 'disability', 'death', 'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  incidentDate: {
    type: Date,
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  
  // Financial Details
  claimedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  approvedAmount: {
    type: Number,
    min: 0
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  paymentDate: Date,
  
  // Supporting Documents
  documents: [documentSchema],
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'submitted', 'under-review', 'documentation-required',
      'approved', 'rejected', 'paid', 'closed'
    ],
    default: 'submitted'
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Investigation
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  investigationNotes: String,
  fraudIndicators: [{
    indicator: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    description: String
  }],
  
  // Rejection/Cancellation
  rejectionReason: String,
  rejectionDate: Date,
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save hook - MUST come AFTER schema definition
claimSchema.pre('save', async function() {
  // Only add initial status history for new documents
  if (this.isNew) {
    this.statusHistory = [{
      status: this.status,
      changedBy: this.createdBy,
      notes: 'Claim submitted'
    }];
  }
  
  // Update status history when status changes (for existing documents)
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.updatedBy || this.createdBy,
      notes: `Status changed to ${this.status}`
    });
  }
});

// Indexes for performance
claimSchema.index({ claimNumber: 1 });
claimSchema.index({ user: 1 });
claimSchema.index({ policy: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ incidentDate: 1 });
claimSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Claim', claimSchema);