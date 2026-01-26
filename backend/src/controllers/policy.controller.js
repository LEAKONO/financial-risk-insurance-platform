const Policy = require('../models/Policy');
const User = require('../models/User');
const RiskProfile = require('../models/RiskProfile');
const PremiumService = require('../services/premium.service');
const emailUtil = require('../utils/email.util');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');
class PolicyController {
  /**
   * Create a new policy
   */
  async createPolicy(req, res) {
    try {
      const { 
        name, 
        description, 
        coverage, 
        policyType, 
        coverageAmount, 
        termLength,
        premiumFrequency 
      } = req.body;
      
      // Get user's risk profile
      const riskProfile = await RiskProfile.findOne({ user: req.user._id });
      
      if (!riskProfile || !riskProfile.isComplete) {
        return res.status(400).json({
          success: false,
          message: 'Complete risk profile required to create policy'
        });
      }
      
      // Calculate premium
      const riskMultiplier = PremiumService.calculateRiskMultiplier(riskProfile);
      const basePremium = PremiumService.calculateBasePremium(policyType, coverageAmount);
      const totalPremium = PremiumService.calculateTotalPremium(policyType, coverageAmount, riskMultiplier);
      const premiumSchedule = PremiumService.generatePremiumSchedule(
        totalPremium,
        premiumFrequency || 'monthly'
      );
      
      // Create policy
      const policy = new Policy({
        user: req.user._id,
        riskProfile: riskProfile._id,
        name,
        description,
        coverage: coverage || [{ type: policyType, coverageAmount }],
        basePremium,
        totalPremium,
        premiumSchedule,
        termLength: termLength || 12,
        riskMultiplier,
        underwrittenBy: req.user.role === 'admin' || req.user.role === 'underwriter' ? req.user._id : null,
        underwrittenDate: req.user.role === 'admin' || req.user.role === 'underwriter' ? new Date() : null,
        status: 'active'
      });
      
      await policy.save();
      
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
          coverage: coverageAmount
        }
      });
      
      // Send confirmation email
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        await emailUtil.sendPolicyCreationEmail(user.email, policy);
      }
      
      res.status(201).json({
        success: true,
        message: 'Policy created successfully',
        data: policy
      });
    } catch (error) {
      logger.error(`Create policy controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create policy'
      });
    }
  }
  
  /**
   * Get user's policies
   */
  async getUserPolicies(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (page - 1) * limit;
      
      const query = { user: req.user._id };
      if (status) query.status = status;
      
      const [policies, total] = await Promise.all([
        Policy.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
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
   * Get policy by ID
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
      
      res.json({
        success: true,
        data: policy
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
   * Update policy
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
      
      // Only allow certain updates
      const allowedUpdates = ['name', 'description', 'isAutoRenewable'];
      const filteredUpdates = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
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
        data: policy
      });
    } catch (error) {
      logger.error(`Update policy controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update policy'
      });
    }
  }
  
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
        message: 'Policy cancelled successfully'
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
          policy.premiumSchedule[0]?.frequency || 'monthly'
        ),
        termLength: termLength || policy.termLength,
        riskMultiplier: policy.riskMultiplier,
        startDate: new Date(),
        status: 'active',
        isAutoRenewable: policy.isAutoRenewable
      });
      
      await renewalPolicy.save();
      
      // Update original policy
      policy.status = 'expired';
      policy.renewalDate = new Date();
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
        data: renewalPolicy
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
   * Get policy documents (simulated)
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
      
      // Simulated documents
      const documents = [
        {
          id: '1',
          name: 'Policy Certificate',
          type: 'pdf',
          url: '/documents/policy-certificate.pdf',
          uploadDate: policy.createdAt
        },
        {
          id: '2',
          name: 'Terms and Conditions',
          type: 'pdf',
          url: '/documents/terms-conditions.pdf',
          uploadDate: policy.createdAt
        },
        {
          id: '3',
          name: 'Premium Schedule',
          type: 'pdf',
          url: '/documents/premium-schedule.pdf',
          uploadDate: policy.createdAt
        }
      ];
      
      res.json({
        success: true,
        data: {
          policy: {
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
   * Get premium payment history
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
      
      // Simulated payment history
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
            number: policy.policyNumber,
            name: policy.name,
            totalPremium: policy.totalPremium
          },
          paymentHistory
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