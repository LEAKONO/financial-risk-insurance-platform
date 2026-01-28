const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger.util');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName, dateOfBirth, phone } = userData;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phone
      });
      
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      
      await user.save();
      
      const tokens = jwt.generateTokens(user);
      
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
      await emailUtil.sendVerificationEmail(user.email, verificationUrl);
      
      await ActivityLog.create({
        user: user._id,
        action: 'register',
        entity: 'auth',
        details: { method: 'email' }
      });
      
      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      };
    } catch (error) {
      logger.error(`Registration service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      if (!user.password) {
        throw new Error('Please use social login or reset password');
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Skip email verification for testing (comment out in production)
      // if (!user.isEmailVerified) {
      //   throw new Error('Please verify your email address');
      // }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
      
      const tokens = jwt.generateTokens(user);
      
      await ActivityLog.create({
        user: user._id,
        action: 'login',
        entity: 'auth',
        details: { method: 'email' }
      });
      
      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      };
    } catch (error) {
      logger.error(`Login service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Verify email address
   */
  async verifyEmail(token) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }
      
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      await ActivityLog.create({
        user: user._id,
        action: 'email_verified',
        entity: 'auth'
      });
      
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      logger.error(`Email verification service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        // For security, don't reveal if user exists
        return {
          success: true,
          message: 'If an account exists with this email, you will receive a reset link'
        };
      }
      
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
      
      await user.save();
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      await emailUtil.sendPasswordResetEmail(user.email, resetUrl);
      
      await ActivityLog.create({
        user: user._id,
        action: 'password_reset_requested',
        entity: 'auth'
      });
      
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a reset link'
      };
    } catch (error) {
      logger.error(`Forgot password service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Reset password
   */
  async resetPassword(token, password) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }
      
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      await ActivityLog.create({
        user: user._id,
        action: 'password_reset',
        entity: 'auth'
      });
      
      return {
        success: true,
        message: 'Password reset successful'
      };
    } catch (error) {
      logger.error(`Reset password service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get current user profile - FIXED: No populate calls
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      logger.error(`Get profile service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth'];
      const updates = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = updateData[key];
        }
      });
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      await ActivityLog.create({
        user: user._id,
        action: 'profile_update',
        entity: 'user',
        details: { updatedFields: Object.keys(updates) }
      });
      
      return user;
    } catch (error) {
      logger.error(`Update profile service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      user.password = newPassword;
      await user.save();
      
      await ActivityLog.create({
        user: user._id,
        action: 'password_change',
        entity: 'auth'
      });
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error(`Change password service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verifyToken(refreshToken, true);
      
      if (!decoded) {
        throw new Error('Invalid refresh token');
      }
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      const tokens = jwt.generateTokens(user);
      
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      logger.error(`Refresh token service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Handle OAuth user
   */
  async handleOAuth(profile, provider) {
    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.com`;
      
      let user = await User.findOne({ 
        $or: [
          { email },
          { oauthId: profile.id }
        ]
      });
      
      if (!user) {
        const name = profile.displayName?.split(' ') || ['User', 'User'];
        user = new User({
          email,
          firstName: name[0],
          lastName: name.slice(1).join(' ') || 'User',
          oauthProvider: provider,
          oauthId: profile.id,
          isEmailVerified: true
        });
        
        await user.save();
        
        await ActivityLog.create({
          user: user._id,
          action: 'register',
          entity: 'auth',
          details: { method: provider }
        });
      }
      
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
      
      await ActivityLog.create({
        user: user._id,
        action: 'login',
        entity: 'auth',
        details: { method: provider }
      });
      
      const tokens = jwt.generateTokens(user);
      
      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      };
    } catch (error) {
      logger.error(`OAuth service error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();