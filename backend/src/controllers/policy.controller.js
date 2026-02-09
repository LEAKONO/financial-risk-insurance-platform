const Policy = require('../models/Policy');
const User = require('../models/User');
const RiskProfile = require('../models/RiskProfile');
const PremiumService = require('../services/premium.service');
const emailUtil = require('../utils/email.util');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');

class PolicyController {
  /**
   * Create a new policy - UPDATED TO MATCH FRONTEND DATA
   */
  async createPolicy(req, res) {
    try {
      console.log('=== CREATE POLICY START ===');
      console.log('Request body:', req.body);
      
      const { 
        name, 
        description, 
        policyType, 
        coverageAmount, 
        termLength,
        premiumFrequency,
        startDate,
        isAutoRenewable,
        beneficiaries
      } = req.body;
      
      // Validate required fields
      if (!policyType) {
        return res.status(400).json({
          success: false,
          message: 'Policy type is required'
        });
      }
      
      if (!coverageAmount || coverageAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Coverage amount must be a positive number'
        });
      }
      
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Policy name is required'
        });
      }
      
      // Get user's risk profile
      const riskProfile = await RiskProfile.findOne({ user: req.user._id });
      console.log('Risk profile found:', riskProfile ? 'Yes' : 'No');
      
      if (!riskProfile || !riskProfile.isComplete) {
        return res.status(400).json({
          success: false,
          message: 'Complete risk profile required to create policy'
        });
      }
      
      // Calculate premium
      console.log('Calculating premiums...');
      const riskMultiplier = PremiumService.calculateRiskMultiplier(riskProfile);
      const basePremium = PremiumService.calculateBasePremium(policyType, coverageAmount);
      const totalPremium = PremiumService.calculateTotalPremium(policyType, coverageAmount, riskMultiplier);
      
      // Generate premium schedule with term length
      const premiumSchedule = PremiumService.generatePremiumSchedule(
        totalPremium,
        premiumFrequency || 'monthly',
        termLength || 12
      );
      
      console.log('Premium calculations:', {
        riskMultiplier,
        basePremium,
        totalPremium,
        premiumFrequency,
        termLength
      });
      
      // Create policy with data from frontend
      const policyData = {
        user: req.user._id,
        riskProfile: riskProfile._id,
        name: name,
        description: description || `${policyType} insurance coverage`,
        coverage: [{
          type: policyType,
          coverageAmount: coverageAmount
        }],
        basePremium,
        totalPremium,
        premiumSchedule,
        termLength: termLength || 12,
        riskMultiplier,
        startDate: startDate ? new Date(startDate) : new Date(),
        underwrittenBy: req.user.role === 'admin' || req.user.role === 'underwriter' ? req.user._id : null,
        underwrittenDate: req.user.role === 'admin' || req.user.role === 'underwriter' ? new Date() : null,
        status: 'active',
        isAutoRenewable: isAutoRenewable !== false,
        // Store beneficiaries if provided (add this to your Policy model schema)
        beneficiaries: beneficiaries || []
      };
      
      console.log('Creating policy with data:', {
        name: policyData.name,
        policyType: policyData.coverage[0].type,
        coverageAmount: policyData.coverage[0].coverageAmount,
        termLength: policyData.termLength,
        startDate: policyData.startDate
      });
      
      const policy = new Policy(policyData);
      
      console.log('Policy object before save:', {
        name: policy.name,
        policyNumber: policy.policyNumber,
        coverage: policy.coverage
      });
      
      await policy.save();
      console.log('Policy saved successfully with ID:', policy._id);
      
      // Update user's policies array
      await User.findByIdAndUpdate(req.user._id, {
        $push: { policies: policy._id }
      });
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'create',
        entity: 'policy',
        entityId: policy._id,
        details: {
          policyNumber: policy.policyNumber,
          premium: totalPremium,
          coverage: coverageAmount,
          policyType: policyType
        }
      });
      
      // Send confirmation email
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        await emailUtil.sendPolicyCreationEmail(user.email, policy);
      }
      
      console.log('=== CREATE POLICY SUCCESS ===');
      
      res.status(201).json({
        success: true,
        message: 'Policy created successfully',
        data: {
          _id: policy._id,
          policyNumber: policy.policyNumber,
          name: policy.name,
          description: policy.description,
          coverage: policy.coverage,
          basePremium: policy.basePremium,
          totalPremium: policy.totalPremium,
          termLength: policy.termLength,
          startDate: policy.startDate,
          endDate: policy.endDate,
          status: policy.status,
          riskMultiplier: policy.riskMultiplier,
          isAutoRenewable: policy.isAutoRenewable,
          beneficiaries: policy.beneficiaries,
          createdAt: policy.createdAt
        }
      });
    } catch (error) {
      console.error('=== CREATE POLICY ERROR ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        console.error('Validation errors:', messages);
        return res.status(400).json({
          success: false,
          message: 'Validation failed: ' + messages.join(', ')
        });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Policy number already exists'
        });
      }
      
      logger.error(`Create policy controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create policy',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get user's policies - UPDATED TO RETURN COMPATIBLE DATA
   */
  async getUserPolicies(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const skip = (page - 1) * limit;
      
      const query = { user: req.user._id };
      
      // Apply filters
      if (status) query.status = status;
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { policyNumber: { $regex: search, $options: 'i' } },
          { 'coverage.type': { $regex: search, $options: 'i' } }
        ];
      }
      
      const [policies, total] = await Promise.all([
        Policy.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean()
          .transform(async (docs) => {
            // Transform data to match frontend expectations
            return docs.map(policy => ({
              id: policy._id,
              _id: policy._id,
              policyNumber: policy.policyNumber,
              name: policy.name,
              description: policy.description,
              type: policy.coverage && policy.coverage[0] ? policy.coverage[0].type : 'unknown',
              coverage: policy.coverage,
              totalCoverage: policy.coverage && policy.coverage[0] ? policy.coverage[0].coverageAmount : 0,
              basePremium: policy.basePremium,
              totalPremium: policy.totalPremium,
              termLength: policy.termLength,
              startDate: policy.startDate,
              endDate: policy.endDate,
              status: policy.status,
              riskMultiplier: policy.riskMultiplier,
              isAutoRenewable: policy.isAutoRenewable,
              beneficiaries: policy.beneficiaries || [],
              createdAt: policy.createdAt,
              updatedAt: policy.updatedAt
            }));
          }),
        Policy.countDocuments(query)
      ]);
      
      res.json({
        success: true,
        data: {
          policies,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Get user policies controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load policies'
      });
    }
  }
  
  /**
   * Get policy by ID - UPDATED FOR FRONTEND
   */
  async getPolicyById(req, res) {
    try {
      const policy = await Policy.findOne({
        _id: req.params.id,
        user: req.user._id
      })
        .populate('riskProfile')
        .lean();
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      // Transform policy data for frontend
      const transformedPolicy = {
        id: policy._id,
        _id: policy._id,
        policyNumber: policy.policyNumber,
        name: policy.name,
        description: policy.description,
        policyType: policy.coverage && policy.coverage[0] ? policy.coverage[0].type : 'unknown',
        coverageAmount: policy.coverage && policy.coverage[0] ? policy.coverage[0].coverageAmount : 0,
        coverage: policy.coverage,
        basePremium: policy.basePremium,
        totalPremium: policy.totalPremium,
        termLength: policy.termLength,
        premiumFrequency: policy.premiumSchedule && policy.premiumSchedule[0] ? 
          policy.premiumSchedule[0].frequency : 'monthly',
        startDate: policy.startDate,
        endDate: policy.endDate,
        status: policy.status,
        riskMultiplier: policy.riskMultiplier,
        isAutoRenewable: policy.isAutoRenewable,
        beneficiaries: policy.beneficiaries || [],
        documents: policy.documents || [],
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt
      };
      
      res.json({
        success: true,
        data: transformedPolicy
      });
    } catch (error) {
      logger.error(`Get policy by ID controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load policy'
      });
    }
  }
  
  /**
   * Update policy - UPDATED FOR FRONTEND
   */
  async updatePolicy(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if policy exists and belongs to user
      const policy = await Policy.findOne({
        _id: id,
        user: req.user._id
      });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      // Only allow certain updates from frontend
      const allowedUpdates = ['name', 'description', 'isAutoRenewable', 'beneficiaries'];
      const filteredUpdates = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      // Special handling for beneficiaries
      if (updates.beneficiaries) {
        // Validate beneficiaries percentages
        const totalPercentage = updates.beneficiaries.reduce((sum, beneficiary) => {
          return sum + (parseFloat(beneficiary.percentage) || 0);
        }, 0);
        
        if (totalPercentage !== 100) {
          return res.status(400).json({
            success: false,
            message: 'Beneficiary percentages must total 100%'
          });
        }
      }
      
      // Update policy
      Object.assign(policy, filteredUpdates);
      policy.updatedAt = new Date();
      await policy.save();
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'update',
        entity: 'policy',
        entityId: policy._id,
        details: {
          policyNumber: policy.policyNumber,
          updatedFields: Object.keys(filteredUpdates)
        }
      });
      
      res.json({
        success: true,
        message: 'Policy updated successfully',
        data: {
          id: policy._id,
          name: policy.name,
          description: policy.description,
          isAutoRenewable: policy.isAutoRenewable,
          beneficiaries: policy.beneficiaries,
          updatedAt: policy.updatedAt
        }
      });
    } catch (error) {
      logger.error(`Update policy controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update policy'
      });
    }
  }
  
  // Other methods remain the same...
  
  /**
   * Cancel policy
   */
  async cancelPolicy(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const policy = await Policy.findOne({
        _id: id,
        user: req.user._id
      });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      if (policy.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Only active policies can be cancelled'
        });
      }
      
      // Update policy status
      policy.status = 'cancelled';
      policy.endDate = new Date();
      policy.updatedAt = new Date();
      await policy.save();
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'cancel',
        entity: 'policy',
        entityId: policy._id,
        details: {
          policyNumber: policy.policyNumber,
          reason: reason || 'User requested cancellation'
        }
      });
      
      res.json({
        success: true,
        message: 'Policy cancelled successfully',
        data: {
          id: policy._id,
          status: policy.status,
          endDate: policy.endDate
        }
      });
    } catch (error) {
      logger.error(`Cancel policy controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel policy'
      });
    }
  }
  
  /**
   * Renew policy
   */
  async renewPolicy(req, res) {
    try {
      const { id } = req.params;
      const { termLength } = req.body;
      
      const policy = await Policy.findOne({
        _id: id,
        user: req.user._id
      });
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      if (policy.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Only active policies can be renewed'
        });
      }
      
      // Create renewal policy
      const renewalPolicy = new Policy({
        user: req.user._id,
        riskProfile: policy.riskProfile,
        name: `${policy.name} (Renewal)`,
        description: policy.description,
        coverage: policy.coverage,
        basePremium: policy.basePremium,
        totalPremium: policy.totalPremium,
        premiumSchedule: PremiumService.generatePremiumSchedule(
          policy.totalPremium,
          policy.premiumSchedule[0]?.frequency || 'monthly',
          termLength || policy.termLength
        ),
        termLength: termLength || policy.termLength,
        riskMultiplier: policy.riskMultiplier,
        startDate: new Date(),
        status: 'active',
        isAutoRenewable: policy.isAutoRenewable,
        beneficiaries: policy.beneficiaries || []
      });
      
      await renewalPolicy.save();
      
      // Update original policy
      policy.status = 'expired';
      policy.renewalDate = new Date();
      policy.updatedAt = new Date();
      await policy.save();
      
      // Update user's policies array
      await User.findByIdAndUpdate(req.user._id, {
        $push: { policies: renewalPolicy._id }
      });
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'renew',
        entity: 'policy',
        entityId: renewalPolicy._id,
        details: {
          originalPolicy: policy.policyNumber,
          renewalPolicy: renewalPolicy.policyNumber
        }
      });
      
      res.json({
        success: true,
        message: 'Policy renewed successfully',
        data: {
          id: renewalPolicy._id,
          policyNumber: renewalPolicy.policyNumber,
          name: renewalPolicy.name,
          termLength: renewalPolicy.termLength,
          startDate: renewalPolicy.startDate
        }
      });
    } catch (error) {
      logger.error(`Renew policy controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to renew policy'
      });
    }
  }
  
  /**
   * Get policy documents (simulated) - UPDATED FOR FRONTEND
   */
  async getPolicyDocuments(req, res) {
    try {
      const { id } = req.params;
      
      const policy = await Policy.findOne({
        _id: id,
        user: req.user._id
      }).lean();
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      // Return actual documents if they exist, otherwise simulated
      const documents = policy.documents && policy.documents.length > 0 
        ? policy.documents.map((doc, index) => ({
            id: doc._id || `doc-${index + 1}`,
            name: doc.name || 'Document',
            type: doc.type || 'pdf',
            url: doc.url || `/documents/${policy.policyNumber}-${index + 1}.pdf`,
            uploadDate: doc.uploadedAt || policy.createdAt,
            size: doc.size || 'Unknown'
          }))
        : [
            {
              id: '1',
              name: 'Policy Certificate',
              type: 'pdf',
              url: `/documents/policy-certificate-${policy.policyNumber}.pdf`,
              uploadDate: policy.createdAt
            },
            {
              id: '2',
              name: 'Terms and Conditions',
              type: 'pdf',
              url: `/documents/terms-conditions-${policy.policyNumber}.pdf`,
              uploadDate: policy.createdAt
            },
            {
              id: '3',
              name: 'Premium Schedule',
              type: 'pdf',
              url: `/documents/premium-schedule-${policy.policyNumber}.pdf`,
              uploadDate: policy.createdAt
            }
          ];
      
      res.json({
        success: true,
        data: {
          policy: {
            id: policy._id,
            number: policy.policyNumber,
            name: policy.name
          },
          documents
        }
      });
    } catch (error) {
      logger.error(`Get policy documents controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load policy documents'
      });
    }
  }
  
  /**
   * Get premium payment history - UPDATED FOR FRONTEND
   */
  async getPaymentHistory(req, res) {
    try {
      const { id } = req.params;
      
      const policy = await Policy.findOne({
        _id: id,
        user: req.user._id
      }).lean();
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      // Generate payment history from premium schedule
      const paymentHistory = policy.premiumSchedule.map((schedule, index) => ({
        id: `payment-${index + 1}`,
        dueDate: schedule.dueDate,
        amount: schedule.amount,
        status: schedule.paid ? 'paid' : 'pending',
        paidDate: schedule.paidDate,
        paymentMethod: schedule.paid ? 'Credit Card' : null,
        receiptNumber: schedule.paid ? `REC-${policy.policyNumber}-${index + 1}` : null
      }));
      
      res.json({
        success: true,
        data: {
          policy: {
            id: policy._id,
            number: policy.policyNumber,
            name: policy.name,
            totalPremium: policy.totalPremium
          },
          paymentHistory,
          total: paymentHistory.length,
          paid: paymentHistory.filter(p => p.status === 'paid').length,
          pending: paymentHistory.filter(p => p.status === 'pending').length
        }
      });
    } catch (error) {
      logger.error(`Get payment history controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load payment history'
      });
    }
  }
}

module.exports = new PolicyController();