const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const crypto = require('crypto');
const { logger } = require('../utils/logger.util');
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName, dateOfBirth, phone } = userData;
      
      // Check for existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phone
      });
      
      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      await user.save();
      
      // Generate tokens
      const tokens = jwt.generateTokens(user);
      
      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await emailUtil.sendVerificationEmail(user.email, verificationUrl);
      
      // Log activity
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
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and tokens
   */
  async login(email, password) {
    try {
      // Find user with password
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check if user has password (social login users)
      if (!user.password) {
        throw new Error('Please use social login or reset password');
      }
      
      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Check email verification
      if (!user.isEmailVerified) {
        throw new Error('Please verify your email address');
      }
      
      // Check account status
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      
      // Update last login
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
      
      // Generate tokens
      const tokens = jwt.generateTokens(user);
      
      // Log activity
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
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      // Hash token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Find user with valid token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }
      
      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      // Log activity
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
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('No account found with this email');
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      
      await user.save();
      
      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await emailUtil.sendPasswordResetEmail(user.email, resetUrl);
      
      // Log activity
      await ActivityLog.create({
        user: user._id,
        action: 'password_reset_requested',
        entity: 'auth'
      });
      
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      logger.error(`Forgot password service error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(token, password) {
    try {
      // Hash token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Find user with valid token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      // Log activity
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
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
        .populate('riskProfile')
        .populate({
          path: 'policies',
          options: { sort: { createdAt: -1 }, limit: 5 }
        });
      
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
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth'];
      const updates = {};
      
      // Filter allowed updates
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
      
      // Log activity
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
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change password result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      // Log activity
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
   * Handle OAuth user creation/retrieval
   * @param {Object} profile - OAuth profile
   * @param {string} provider - OAuth provider
   * @returns {Promise<Object>} User data and tokens
   */
  async handleOAuth(profile, provider) {
    try {
      const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.com`;
      
      let user = await User.findOne({ 
        $or: [
          { email },
          { oauthId: profile.id, oauthProvider: provider }
        ]
      });
      
      if (!user) {
        // Create new user
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
        
        // Log registration
        await ActivityLog.create({
          user: user._id,
          action: 'register',
          entity: 'auth',
          details: { method: provider }
        });
      } else if (!user.oauthProvider) {
        // Link existing account
        user.oauthProvider = provider;
        user.oauthId = profile.id;
        await user.save();
      }
      
      // Update login info
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();
      
      // Log login
      await ActivityLog.create({
        user: user._id,
        action: 'login',
        entity: 'auth',
        details: { method: provider }
      });
      
      // Generate tokens
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