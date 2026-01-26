const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const crypto = require('crypto');
const { logger } = require('../utils/logger.util');
class AuthController {
  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, dateOfBirth, phone } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
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
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          tokens
        }
      });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }
  
  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if user has password (social login users)
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Please use social login or reset password'
        });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email address'
        });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
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
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          tokens
        }
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }
  
  /**
   * Verify email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
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
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
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
      
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error(`Email verification error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: error.message
      });
    }
  }
  
  /**
   * Forgot password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
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
      
      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset',
        error: error.message
      });
    }
  }
  
  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
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
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
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
      
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: error.message
      });
    }
  }
  
  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }
      
      const result = await jwt.refreshAccessToken(refreshToken);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  }
  
  /**
   * Logout
   */
  async logout(req, res) {
    try {
      // In a stateless JWT system, we can't invalidate tokens.
      // Client should delete tokens from storage.
      // For enhanced security, you might want to implement a token blacklist.
      
      await ActivityLog.create({
        user: req.user._id,
        action: 'logout',
        entity: 'auth'
      });
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }
  
  /**
   * OAuth callback
   */
  async oauthCallback(req, res) {
    try {
      const tokens = jwt.generateTokens(req.user);
      
      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error(`OAuth callback error: ${error.message}`);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
}

module.exports = new AuthController();