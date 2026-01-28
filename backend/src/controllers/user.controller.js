const User = require('../models/User');
const AuthService = require('../services/auth.service');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');

class UserController {
  /**
   * Get current user profile - SIMPLE VERSION
   */
  async getProfile(req, res) {
    try {
      // Use simple query instead of AuthService
      const user = await User.findById(req.user._id)
        .select('email firstName lastName role isEmailVerified phone dateOfBirth lastLogin createdAt');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error(`Get profile controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      });
    }
  }
   /**
   * Get user dashboard data
   */
  async getDashboard(req, res) {
    try {
      // Get basic user info
      const user = await User.findById(req.user._id)
        .select('firstName lastName email role lastLogin createdAt');
      
      // Get user's policies count
      const Policy = require('../models/Policy');
      const policiesCount = await Policy.countDocuments({ user: req.user._id });
      
      // Get recent activities
      const recentActivities = await ActivityLog.find({ user: req.user._id })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();
      
      res.json({
        success: true,
        data: {
          user,
          stats: {
            policies: policiesCount,
            // Add more stats as needed
          },
          recentActivities
        }
      });
    } catch (error) {
      logger.error(`Get dashboard controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load dashboard'
      });
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const user = await AuthService.updateProfile(req.user._id, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      logger.error(`Update profile controller error: ${error.message}`);
      res.status(error.message === 'User not found' ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Change user password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const result = await AuthService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error(`Change password controller error: ${error.message}`);
      res.status(error.message === 'User not found' ? 404 : 
                error.message === 'Current password is incorrect' ? 400 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get user activity log
   */
  async getActivityLog(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const [activities, total] = await Promise.all([
        ActivityLog.find({ user: req.user._id })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ActivityLog.countDocuments({ user: req.user._id })
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
      logger.error(`Get activity log controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load activity log'
      });
    }
  }
  
  /**
   * Delete user account
   */
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }
      
      const user = await User.findById(req.user._id).select('+password');
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password'
        });
      }
      
      user.isActive = false;
      await user.save();
      
      await ActivityLog.create({
        user: req.user._id,
        action: 'account_deactivated',
        entity: 'user',
        details: { method: 'user_request' }
      });
      
      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      logger.error(`Delete account controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  }
  
  /**
   * Upload profile picture
   */
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          url: req.file.path,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      logger.error(`Upload profile picture controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture'
      });
    }
  }
  
  /**
   * Get all users (admin only)
   */
  async getUsers(req, res) {
    try {
      const users = await User.find({}).select('-password');
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error(`Get users controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }
  
  /**
   * Get user by ID (admin only)
   */
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Get user by ID controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get user'
      });
    }
  }
  
  /**
   * TEMPORARY: Direct profile endpoint without service layer
   */
  async getProfileDirect(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .select('email firstName lastName role isEmailVerified phone');
      
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Direct profile error'
      });
    }
  }
}

module.exports = new UserController();