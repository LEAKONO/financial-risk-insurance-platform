const Policy = require('../models/Policy');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');

class ApplicationController {
  /**
   * Submit policy application
   */
  async submitApplication(req, res) {
    try {
      const {
        quoteId,
        policyType,
        coverageAmount,
        termLength,
        premiumAmount,
        personalInfo = {},
        beneficiaries = [],
        medicalInfo = {}
      } = req.body;

      // Validate required fields
      if (!quoteId || !policyType || !coverageAmount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: quoteId, policyType, coverageAmount'
        });
      }

      // Check if user has risk profile
      const RiskProfile = require('../models/RiskProfile');
      const riskProfile = await RiskProfile.findOne({ user: req.user._id });
      
      if (!riskProfile || !riskProfile.isComplete) {
        return res.status(400).json({
          success: false,
          message: 'Complete risk profile required before applying'
        });
      }

      // Create application record (in real app, you'd have an Application model)
      const application = {
        applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: req.user._id,
        quoteId,
        policyType,
        coverageAmount,
        termLength: termLength || 20,
        premiumAmount: premiumAmount || this.calculatePremium(coverageAmount, policyType),
        personalInfo: {
          ...personalInfo,
          // Default to user profile info if not provided
          firstName: personalInfo.firstName || req.user.firstName,
          lastName: personalInfo.lastName || req.user.lastName,
          email: personalInfo.email || req.user.email,
          phone: personalInfo.phone || req.user.phone,
          dateOfBirth: personalInfo.dateOfBirth || req.user.dateOfBirth
        },
        beneficiaries,
        medicalInfo,
        status: 'submitted',
        submittedAt: new Date(),
        underwritingStatus: 'pending',
        riskProfileId: riskProfile._id
      };

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'application_submitted',
        entity: 'application',
        entityId: application.applicationId,
        details: {
          policyType,
          coverageAmount,
          applicationId: application.applicationId
        }
      });

      // Notify underwriters (in real app, send email/notification)
      this.notifyUnderwriters(application);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          applicationId: application.applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          nextSteps: [
            'Underwriting review (3-5 business days)',
            'Medical examination may be required',
            'You will be notified of the decision'
          ]
        }
      });
    } catch (error) {
      logger.error(`Submit application controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }

  /**
   * Calculate premium (fallback if not provided in quote)
   */
  calculatePremium(coverageAmount, policyType) {
    const rates = {
      life: 0.015,
      health: 0.02,
      auto: 0.025,
      property: 0.018,
      disability: 0.012
    };
    
    const rate = rates[policyType] || rates.life;
    return coverageAmount * rate * 20; // Default 20-year term
  }

  /**
   * Notify underwriters about new application
   */
  async notifyUnderwriters(application) {
    try {
      // Find all underwriters and admins
      const underwriters = await User.find({
        role: { $in: ['underwriter', 'admin'] },
        isActive: true
      }).select('email firstName lastName');

      // In real app, send email or push notification
      console.log(`Notifying ${underwriters.length} underwriters about application ${application.applicationId}`);
      
      // Log notification
      await ActivityLog.create({
        user: application.userId,
        action: 'underwriter_notified',
        entity: 'application',
        entityId: application.applicationId,
        details: {
          applicationId: application.applicationId,
          notifiedCount: underwriters.length
        }
      });
    } catch (error) {
      console.error('Failed to notify underwriters:', error.message);
    }
  }

  /**
   * Get application status
   */
  async getApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;

      // In real app, fetch from Application model
      // For now, return mock data
      const mockApplications = {
        'APP-123': {
          status: 'under_review',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          underwriterAssigned: 'John Smith',
          documentsRequired: ['Medical exam', 'Proof of income'],
          notes: 'Application is currently being reviewed by our underwriting team.'
        },
        'APP-456': {
          status: 'approved',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          policyNumber: 'POL-789012',
          premiumAmount: 1250,
          nextSteps: ['Make first premium payment', 'Sign policy documents']
        }
      };

      const application = mockApplications[applicationId] || {
        status: 'not_found',
        message: 'Application not found'
      };

      if (application.status === 'not_found') {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      logger.error(`Get application status controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get application status'
      });
    }
  }

  /**
   * Get user's applications
   */
  async getUserApplications(req, res) {
    try {
      // In real app, fetch from Application model
      const mockApplications = [
        {
          applicationId: 'APP-123',
          policyType: 'life',
          coverageAmount: 250000,
          status: 'under_review',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          premiumAmount: 1875
        },
        {
          applicationId: 'APP-456',
          policyType: 'health',
          coverageAmount: 100000,
          status: 'approved',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          policyNumber: 'POL-789012'
        }
      ];

      res.json({
        success: true,
        data: {
          applications: mockApplications,
          total: mockApplications.length,
          pending: mockApplications.filter(app => app.status === 'under_review').length,
          approved: mockApplications.filter(app => app.status === 'approved').length
        }
      });
    } catch (error) {
      logger.error(`Get user applications controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get applications'
      });
    }
  }
}

module.exports = new ApplicationController();