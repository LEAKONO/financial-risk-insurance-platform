// backend/src/controllers/admin.controller.js - FIXED VERSION
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const RiskProfile = require('../models/RiskProfile');
const ActivityLog = require('../models/ActivityLog');
const AnalyticsService = require('../services/analytics.service');
const ClaimService = require('../services/claim.service');
const { logger } = require('../utils/logger.util');

class AdminController {
  /**
   * Get admin dashboard data
   */
  async getDashboard(req, res) {
    try {
      const analytics = await AnalyticsService.getSystemAnalytics();
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error(`Get admin dashboard controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard data'
      });
    }
  }
  
  /**
   * Get all users
   */
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, role, isActive, search } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {};
      
      if (role) query.role = role;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }
      
      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
          .populate('riskProfile')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        User.countDocuments(query)
      ]);
      
      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Get users controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load users'
      });
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
        .populate('riskProfile')
        .populate({
          path: 'policies',
          options: { sort: { createdAt: -1 } }
        })
        .lean();
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Get user's claims
      const claims = await Claim.find({ user: req.params.id })
        .populate('policy', 'policyNumber name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      // Get user activity log
      const activities = await ActivityLog.find({ user: req.params.id })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();
      
      res.json({
        success: true,
        data: {
          ...user,
          claims,
          activities
        }
      });
    } catch (error) {
      logger.error(`Get user by ID controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load user'
      });
    }
  }
  
  /**
   * Update user role
   */
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!['admin', 'underwriter', 'customer'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'update_role',
        entity: 'user',
        entityId: user._id,
        details: {
          targetUser: user.email,
          newRole: role
        }
      });
      
      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      logger.error(`Update user role controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role'
      });
    }
  }
  
  /**
   * Toggle user active status
   */
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Cannot deactivate self
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }
      
      user.isActive = !user.isActive;
      await user.save();
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: user.isActive ? 'activate_user' : 'deactivate_user',
        entity: 'user',
        entityId: user._id,
        details: {
          targetUser: user.email,
          status: user.isActive ? 'active' : 'inactive'
        }
      });
      
      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { isActive: user.isActive }
      });
    } catch (error) {
      logger.error(`Toggle user status controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }
  
  /**
   * Get all policies (admin view)
   */
  async getPolicies(req, res) {
    try {
      const { page = 1, limit = 20, status, policyType, userId } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {};
      
      if (status) query.status = status;
      if (userId) query.user = userId;
      
      if (policyType) {
        query['coverage.type'] = policyType;
      }
      
      const [policies, total] = await Promise.all([
        Policy.find(query)
          .populate('user', 'firstName lastName email')
          .populate('riskProfile')
          .populate('underwrittenBy', 'firstName lastName email')
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
      logger.error(`Get policies controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load policies'
      });
    }
  }
  
  /**
   * Update policy status (admin only)
   */
  async updatePolicyStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['active', 'expired', 'cancelled', 'lapsed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      const policy = await Policy.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('user', 'firstName lastName email');
      
      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }
      
      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'update_policy_status',
        entity: 'policy',
        entityId: policy._id,
        details: {
          policyNumber: policy.policyNumber,
          newStatus: status
        }
      });
      
      res.json({
        success: true,
        message: 'Policy status updated successfully',
        data: policy
      });
    } catch (error) {
      logger.error(`Update policy status controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update policy status'
      });
    }
  }
  
  /**
   * Get system activity log
   */
  async getSystemActivity(req, res) {
    try {
      const { page = 1, limit = 50, entity, action, userId, startDate, endDate } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {};
      
      if (entity) query.entity = entity;
      if (action) query.action = action;
      if (userId) query.user = userId;
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      const [activities, total] = await Promise.all([
        ActivityLog.find(query)
          .populate('user', 'firstName lastName email')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ActivityLog.countDocuments(query)
      ]);
      
      res.json({
        success: true,
        data: {
          activities,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Get system activity controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load system activity'
      });
    }
  }
  
  /**
   * Get recent activity - FIXED VERSION
   */
  async getRecentActivity(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      const activities = await ActivityLog.find()
        .populate('user', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      // Format activities for frontend - using arrow functions to preserve 'this'
      const formattedActivities = activities.map(activity => {
        const actionLabels = {
          'user_login': 'User Login',
          'user_register': 'User Registration',
          'policy_created': 'Policy Created',
          'policy_updated': 'Policy Updated',
          'claim_submitted': 'Claim Submitted',
          'claim_updated': 'Claim Updated',
          'payment_processed': 'Payment Processed',
          'update_role': 'Role Updated',
          'activate_user': 'User Activated',
          'deactivate_user': 'User Deactivated',
          'update_policy_status': 'Policy Status Updated',
          'generate_report': 'Report Generated',
          'risk_assessment': 'Risk Assessment',
          'profile_update': 'Profile Updated'
        };
        
        const icons = {
          'user_login': '👤',
          'user_register': '📝',
          'policy_created': '📄',
          'policy_updated': '✏️',
          'claim_submitted': '⚠️',
          'claim_updated': '🔄',
          'payment_processed': '💰',
          'update_role': '🛡️',
          'activate_user': '✅',
          'deactivate_user': '❌',
          'update_policy_status': '📊',
          'generate_report': '📈',
          'risk_assessment': '📋',
          'profile_update': '👤'
        };
        
        const details = activity.details || {};
        
        const getDescription = () => {
          switch (activity.action) {
            case 'user_login':
              return `User logged in from IP: ${details.ip || 'Unknown'}`;
            case 'user_register':
              return `New user registered: ${details.email || 'Unknown'}`;
            case 'policy_created':
              return `Policy created: ${details.policyNumber || 'Unknown'}`;
            case 'claim_submitted':
              return `Claim submitted: ${details.claimNumber || 'Unknown'}`;
            case 'update_role':
              return `Updated role for ${details.targetUser || 'user'} to ${details.newRole || 'Unknown'}`;
            case 'activate_user':
            case 'deactivate_user':
              return `${activity.action === 'activate_user' ? 'Activated' : 'Deactivated'} user: ${details.targetUser || 'Unknown'}`;
            case 'update_policy_status':
              return `Updated policy ${details.policyNumber || 'Unknown'} to ${details.newStatus || 'Unknown'}`;
            case 'generate_report':
              return `Generated ${details.reportType || 'Unknown'} report`;
            default:
              const actionLabel = actionLabels[activity.action] || activity.action.replace(/_/g, ' ').toUpperCase();
              return `${actionLabel} performed`;
          }
        };
        
        const getType = () => {
          const action = activity.action;
          if (action.includes('user')) return 'user';
          if (action.includes('policy')) return 'policy';
          if (action.includes('claim')) return 'claim';
          if (action.includes('payment')) return 'payment';
          if (action.includes('report')) return 'report';
          return 'system';
        };
        
        return {
          id: activity._id,
          action: actionLabels[activity.action] || activity.action.replace(/_/g, ' ').toUpperCase(),
          user: {
            name: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System',
            email: activity.user?.email || 'system'
          },
          description: getDescription(),
          timestamp: activity.timestamp,
          icon: icons[activity.action] || '📝',
          type: getType()
        };
      });
      
      res.json({
        success: true,
        data: formattedActivities,
        total: formattedActivities.length
      });
    } catch (error) {
      logger.error(`Get recent activity controller error: ${error.message}`);
      console.error(error.stack); // Add this to see full error
      res.status(500).json({
        success: false,
        message: 'Failed to load recent activities'
      });
    }
  }
  
  /**
   * Get financial report
   */
  async getFinancialReport(req, res) {
    try {
      const { startDate, endDate, policyType } = req.query;
      
      const report = await AnalyticsService.getFinancialReport({
        startDate,
        endDate,
        policyType
      });
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error(`Get financial report controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to generate financial report'
      });
    }
  }
  
  /**
   * Get risk profiles overview
   */
  async getRiskProfilesOverview(req, res) {
    try {
      const riskProfiles = await RiskProfile.aggregate([
        {
          $group: {
            _id: '$riskCategory',
            count: { $sum: 1 },
            avgScore: { $avg: '$overallRiskScore' },
            avgAge: { $avg: '$age' },
            avgIncome: { $avg: '$annualIncome' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Get top risk factors
      const topRiskFactors = await RiskProfile.aggregate([
        { $unwind: '$riskFactors' },
        {
          $group: {
            _id: '$riskFactors.factor',
            count: { $sum: 1 },
            avgMultiplier: { $avg: '$riskFactors.multiplier' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      res.json({
        success: true,
        data: {
          riskDistribution: riskProfiles,
          topRiskFactors,
          totalProfiles: await RiskProfile.countDocuments(),
          completeProfiles: await RiskProfile.countDocuments({ isComplete: true })
        }
      });
    } catch (error) {
      logger.error(`Get risk profiles overview controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load risk profiles overview'
      });
    }
  }
  
  /**
   * Generate system report
   */
  async generateSystemReport(req, res) {
    try {
      const { reportType, startDate, endDate } = req.body;
      
      let report;
      
      switch (reportType) {
        case 'users':
          report = await this.generateUserReport(startDate, endDate);
          break;
        case 'policies':
          report = await this.generatePolicyReport(startDate, endDate);
          break;
        case 'claims':
          report = await this.generateClaimReport(startDate, endDate);
          break;
        case 'financial':
          report = await AnalyticsService.getFinancialReport({ startDate, endDate });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }
      
      // Log report generation
      await ActivityLog.create({
        user: req.user._id,
        action: 'generate_report',
        entity: 'system',
        details: {
          reportType,
          startDate,
          endDate
        }
      });
      
      res.json({
        success: true,
        message: 'Report generated successfully',
        data: report
      });
    } catch (error) {
      logger.error(`Generate system report controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report'
      });
    }
  }
  
  /**
   * Generate user report
   */
  async generateUserReport(startDate, endDate) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const users = await User.find(dateFilter)
      .select('firstName lastName email role isActive createdAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();
    
    const roleDistribution = await User.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const monthlyGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    return {
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        roleDistribution,
        monthlyGrowth
      },
      users
    };
  }
  
  /**
   * Generate policy report
   */
  async generatePolicyReport(startDate, endDate) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const policies = await Policy.find(dateFilter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
    
    const statusDistribution = await Policy.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, totalPremium: { $sum: '$totalPremium' } } }
    ]);
    
    const typeDistribution = await Policy.aggregate([
      { $match: dateFilter },
      { $unwind: '$coverage' },
      { $group: { _id: '$coverage.type', count: { $sum: 1 }, totalCoverage: { $sum: '$coverage.coverageAmount' } } }
    ]);
    
    return {
      summary: {
        totalPolicies: policies.length,
        totalPremium: policies.reduce((sum, p) => sum + p.totalPremium, 0),
        totalCoverage: policies.reduce((sum, p) => sum + p.coverage.reduce((s, c) => s + c.coverageAmount, 0), 0),
        statusDistribution,
        typeDistribution
      },
      policies
    };
  }
  
  /**
   * Generate claim report
   */
  async generateClaimReport(startDate, endDate) {
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const claims = await Claim.find(dateFilter)
      .populate('user', 'firstName lastName email')
      .populate('policy', 'policyNumber name')
      .sort({ createdAt: -1 })
      .lean();
    
    const statistics = await ClaimService.getClaimStatistics();
    
    const typeDistribution = await Claim.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$type', count: { $sum: 1 }, totalClaimed: { $sum: '$claimedAmount' } } }
    ]);
    
    return {
      summary: {
        totalClaims: claims.length,
        statistics,
        typeDistribution
      },
      claims
    };
  }
}

module.exports = new AdminController();