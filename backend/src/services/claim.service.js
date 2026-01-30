const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const emailUtil = require('../utils/email.util');
const { upload, deleteFile } = require('../config/cloudinary');
const { logger } = require('../utils/logger.util');

class ClaimService {
  /**
   * Generate a unique claim number
   */
  generateClaimNumber() {
    const prefix = 'CLM';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000 + 1000);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create a new claim
   * @param {Object} claimData - Claim data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created claim
   */
  async createClaim(claimData, userId) {
    try {
      // FIXED: Use 'policy' instead of 'policyId'
      const { policy, type, description, incidentDate, claimedAmount, documents } = claimData;
      
      // Debug logging
      console.log('DEBUG - Creating claim:', {
        policyId: policy,
        userId,
        claimData: { type, description, claimedAmount }
      });
      
      // First check if policy exists
      const policyDoc = await Policy.findById(policy);
      
      if (!policyDoc) {
        throw new Error('Policy not found');
      }
      
      // Check if policy is active
      if (policyDoc.status !== 'active') {
        throw new Error(`Policy is ${policyDoc.status}, must be active to file a claim`);
      }
      
      // Check if user has access to policy
      // For admin users, skip ownership check
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.role !== 'admin') {
        if (policyDoc.user.toString() !== userId.toString()) {
          throw new Error('You do not have access to this policy');
        }
      }
      
      // Check maximum coverage
      const maxCoverage = policyDoc.coverage.reduce((sum, cov) => sum + cov.coverageAmount, 0);
      if (claimedAmount > maxCoverage) {
        throw new Error(`Claimed amount cannot exceed policy coverage of $${maxCoverage}`);
      }
      
      // Generate claim number
      const claimNumber = this.generateClaimNumber();
      
      // Create claim
      const claim = new Claim({
        policy: policy,
        user: userId,
        type,
        description,
        incidentDate: new Date(incidentDate),
        claimedAmount,
        documents: documents || [],
        createdBy: userId,
        claimNumber: claimNumber
      });
      
      await claim.save();
      
      // Update policy claim statistics
      policyDoc.totalClaims += 1;
      policyDoc.totalClaimAmount += claimedAmount;
      await policyDoc.save();
      
      // Log activity
      await ActivityLog.create({
        user: userId,
        action: 'create',
        entity: 'claim',
        entityId: claim._id,
        details: {
          claimNumber: claim.claimNumber,
          policyNumber: policyDoc.policyNumber,
          claimedAmount
        }
      });
      
      // Send notification email
      if (user && user.email) {
        await emailUtil.sendClaimStatusEmail(user.email, claim);
      }
      
      return claim;
    } catch (error) {
      logger.error(`Create claim error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get user's claims
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User claims
   */
  async getUserClaims(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      
      const query = { user: userId };
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      
      const [claims, total] = await Promise.all([
        Claim.find(query)
          .populate('policy', 'policyNumber name')
          .populate('assignee', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Claim.countDocuments(query)
      ]);
      
      return {
        claims,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Get user claims error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get claim by ID
   * @param {string} claimId - Claim ID
   * @param {string} userId - User ID (optional for admin access)
   * @returns {Promise<Object>} Claim details
   */
  async getClaimById(claimId, userId = null) {
    try {
      const query = { _id: claimId };
      
      // If userId provided, restrict to user's claims (for non-admin)
      if (userId) {
        const user = await User.findById(userId);
        if (user.role !== 'admin' && user.role !== 'underwriter') {
          query.user = userId;
        }
      }
      
      const claim = await Claim.findOne(query)
        .populate('policy', 'policyNumber name coverage user')
        .populate('user', 'firstName lastName email')
        .populate('assignee', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .lean();
      
      if (!claim) {
        throw new Error('Claim not found');
      }
      
      return claim;
    } catch (error) {
      logger.error(`Get claim by ID error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update claim status
   * @param {string} claimId - Claim ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID performing the update
   * @returns {Promise<Object>} Updated claim
   */
  async updateClaimStatus(claimId, updateData, userId) {
    try {
      const { status, notes, approvedAmount, rejectionReason } = updateData;
      
      const claim = await Claim.findById(claimId);
      
      if (!claim) {
        throw new Error('Claim not found');
      }
      
      // Check if user can update status
      const user = await User.findById(userId);
      if (user.role !== 'admin' && user.role !== 'underwriter') {
        throw new Error('Unauthorized to update claim status');
      }
      
      // Validate status transition
      this.validateStatusTransition(claim.status, status);
      
      // Update claim
      const updates = {
        status,
        updatedBy: userId
      };
      
      if (notes) {
        updates.investigationNotes = notes;
      }
      
      if (status === 'approved' && approvedAmount) {
        if (approvedAmount > claim.claimedAmount) {
          throw new Error('Approved amount cannot exceed claimed amount');
        }
        updates.approvedAmount = approvedAmount;
      }
      
      if (status === 'rejected' && rejectionReason) {
        updates.rejectionReason = rejectionReason;
        updates.rejectionDate = new Date();
      }
      
      if (status === 'paid' && claim.approvedAmount) {
        updates.paidAmount = claim.approvedAmount;
        updates.paymentDate = new Date();
      }
      
      Object.assign(claim, updates);
      await claim.save();
      
      // Log activity
      await ActivityLog.create({
        user: userId,
        action: 'update_status',
        entity: 'claim',
        entityId: claim._id,
        details: {
          claimNumber: claim.claimNumber,
          oldStatus: claim.statusHistory[claim.statusHistory.length - 2]?.status,
          newStatus: status,
          approvedAmount,
          rejectionReason
        }
      });
      
      // Send notification email to claim owner
      const claimOwner = await User.findById(claim.user);
      if (claimOwner && claimOwner.email) {
        await emailUtil.sendClaimStatusEmail(claimOwner.email, claim);
      }
      
      return claim;
    } catch (error) {
      logger.error(`Update claim status error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Assign claim to underwriter
   * @param {string} claimId - Claim ID
   * @param {string} assigneeId - Assignee user ID
   * @param {string} userId - User ID performing assignment
   * @returns {Promise<Object>} Updated claim
   */
  async assignClaim(claimId, assigneeId, userId) {
    try {
      const claim = await Claim.findById(claimId);
      
      if (!claim) {
        throw new Error('Claim not found');
      }
      
      // Verify assignee is an underwriter or admin
      const assignee = await User.findById(assigneeId);
      if (!assignee || (assignee.role !== 'underwriter' && assignee.role !== 'admin')) {
        throw new Error('Assignee must be an underwriter or admin');
      }
      
      claim.assignee = assigneeId;
      claim.updatedBy = userId;
      await claim.save();
      
      // Log activity
      await ActivityLog.create({
        user: userId,
        action: 'assign',
        entity: 'claim',
        entityId: claim._id,
        details: {
          claimNumber: claim.claimNumber,
          assigneeId,
          assigneeName: `${assignee.firstName} ${assignee.lastName}`
        }
      });
      
      return claim;
    } catch (error) {
      logger.error(`Assign claim error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Upload claim document
   * @param {Object} file - Uploaded file
   * @param {string} claimId - Claim ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Uploaded document info
   */
  async uploadDocument(file, claimId, userId) {
    try {
      const claim = await Claim.findById(claimId);
      
      if (!claim) {
        throw new Error('Claim not found');
      }
      
      // Verify user has access to claim
      if (claim.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to upload documents for this claim');
      }
      
      // Add document to claim
      const document = {
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        uploadDate: new Date()
      };
      
      claim.documents.push(document);
      await claim.save();
      
      // Log activity
      await ActivityLog.create({
        user: userId,
        action: 'upload_document',
        entity: 'claim',
        entityId: claim._id,
        details: {
          claimNumber: claim.claimNumber,
          documentName: file.originalname,
          documentType: file.mimetype
        }
      });
      
      return document;
    } catch (error) {
      logger.error(`Upload document error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Delete claim document
   * @param {string} claimId - Claim ID
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteDocument(claimId, documentId, userId) {
    try {
      const claim = await Claim.findById(claimId);
      
      if (!claim) {
        throw new Error('Claim not found');
      }
      
      // Verify user has access to claim
      if (claim.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete documents for this claim');
      }
      
      const document = claim.documents.id(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Delete from Cloudinary
      if (document.url) {
        const publicId = document.url.split('/').pop().split('.')[0];
        await deleteFile(publicId);
      }
      
      // Remove document
      document.remove();
      await claim.save();
      
      // Log activity
      await ActivityLog.create({
        user: userId,
        action: 'delete_document',
        entity: 'claim',
        entityId: claim._id,
        details: {
          claimNumber: claim.claimNumber,
          documentName: document.name
        }
      });
      
      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      logger.error(`Delete document error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get claims for admin/underwriter view
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Claims with pagination
   */
  async getAdminClaims(filters = {}, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        assigneeId, 
        startDate, 
        endDate,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;
      
      const query = {};
      
      // Apply filters
      if (status) query.status = status;
      if (assigneeId) query.assignee = assigneeId;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      
      const [claims, total] = await Promise.all([
        Claim.find(query)
          .populate('policy', 'policyNumber name')
          .populate('user', 'firstName lastName email')
          .populate('assignee', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Claim.countDocuments(query)
      ]);
      
      return {
        claims,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        filters
      };
    } catch (error) {
      logger.error(`Get admin claims error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Validate claim status transition
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status
   */
  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'submitted': ['under-review', 'documentation-required', 'rejected'],
      'under-review': ['approved', 'rejected', 'documentation-required'],
      'documentation-required': ['under-review', 'rejected'],
      'approved': ['paid', 'rejected'],
      'rejected': ['closed'],
      'paid': ['closed'],
      'closed': [] // No transitions from closed
    };
    
    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
  
  /**
   * Analyze claim for fraud indicators
   * @param {Object} claim - Claim object
   * @returns {Promise<Array>} Fraud indicators
   */
  async analyzeForFraud(claim) {
    try {
      const indicators = [];
      
      // Check if incident date is recent
      const incidentDate = new Date(claim.incidentDate);
      const today = new Date();
      const daysSinceIncident = Math.floor((today - incidentDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceIncident < 7) {
        indicators.push({
          indicator: 'recent_incident',
          severity: 'low',
          description: 'Claim filed shortly after incident'
        });
      }
      
      // Check claim amount relative to policy coverage
      const policy = await Policy.findById(claim.policy).lean();
      if (policy) {
        const maxCoverage = policy.coverage.reduce((sum, cov) => sum + cov.coverageAmount, 0);
        const coveragePercentage = (claim.claimedAmount / maxCoverage) * 100;
        
        if (coveragePercentage > 80) {
          indicators.push({
            indicator: 'high_coverage_utilization',
            severity: 'medium',
            description: `Claim uses ${coveragePercentage.toFixed(1)}% of policy coverage`
          });
        }
      }
      
      // Check user's claim history
      const userClaims = await Claim.find({ 
        user: claim.user,
        _id: { $ne: claim._id }
      }).lean();
      
      if (userClaims.length > 2) {
        indicators.push({
          indicator: 'frequent_claimant',
          severity: 'medium',
          description: `User has filed ${userClaims.length + 1} claims total`
        });
      }
      
      return indicators;
    } catch (error) {
      logger.error(`Fraud analysis error: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Get claim statistics
   * @returns {Promise<Object>} Claim statistics
   */
  async getClaimStatistics() {
    try {
      const [
        totalClaims,
        approvedClaims,
        rejectedClaims,
        pendingClaims,
        averageClaimAmount,
        totalClaimedAmount,
        totalPaidAmount,
        monthlyTrend
      ] = await Promise.all([
        Claim.countDocuments(),
        Claim.countDocuments({ status: 'approved' }),
        Claim.countDocuments({ status: 'rejected' }),
        Claim.countDocuments({ status: { $in: ['submitted', 'under-review', 'documentation-required'] } }),
        Claim.aggregate([
          { $group: { _id: null, average: { $avg: '$claimedAmount' } } }
        ]),
        Claim.aggregate([
          { $group: { _id: null, total: { $sum: '$claimedAmount' } } }
        ]),
        Claim.aggregate([
          { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]),
        Claim.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 },
              totalClaimed: { $sum: '$claimedAmount' },
              totalPaid: { $sum: '$paidAmount' }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 6 }
        ])
      ]);
      
      return {
        total: totalClaims,
        approved: approvedClaims,
        rejected: rejectedClaims,
        pending: pendingClaims,
        averageAmount: averageClaimAmount[0]?.average || 0,
        totalClaimed: totalClaimedAmount[0]?.total || 0,
        totalPaid: totalPaidAmount[0]?.total || 0,
        approvalRate: totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0,
        monthlyTrend: monthlyTrend.map(month => ({
          month: `${month._id.year}-${String(month._id.month).padStart(2, '0')}`,
          count: month.count,
          claimed: month.totalClaimed,
          paid: month.totalPaid
        }))
      };
    } catch (error) {
      logger.error(`Get claim statistics error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ClaimService();