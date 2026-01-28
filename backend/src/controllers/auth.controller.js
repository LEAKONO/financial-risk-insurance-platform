const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class AuthController {
  /**
   * Register new user - WORKING VERSION
   */
  async register(req, res) {
    try {
      console.log('Registration attempt:', req.body);
      
      const { email, password, firstName, lastName, dateOfBirth, phone } = req.body;
      
      // Basic validation
      if (!email || !password || !firstName || !lastName || !dateOfBirth || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }
      
      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }
      
      // Hash password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const user = new User({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        phone: phone.trim()
      });
      
      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      
      // Check if SMTP is configured
      const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS && 
                              process.env.SMTP_USER.trim() !== '' && 
                              process.env.SMTP_PASS.trim() !== '';
      
      let emailSent = false;
      
      // Try to send verification email
      if (isSmtpConfigured) {
        try {
          const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
          await emailUtil.sendVerificationEmail(user.email, verificationUrl);
          emailSent = true;
        } catch (emailError) {
          console.warn('Email sending failed:', emailError.message);
          user.isEmailVerified = true;
        }
      } else {
        user.isEmailVerified = true;
      }
      
      // Save user
      await user.save();
      console.log('User saved successfully:', user._id);
      
      // Generate tokens
      const tokens = jwt.generateTokens(user);
      
      // Log activity
      try {
        await ActivityLog.create({
          user: user._id,
          action: 'register',
          entity: 'auth',
          details: { 
            method: 'email',
            emailSent,
            isEmailVerified: user.isEmailVerified
          }
        });
      } catch (logError) {
        console.warn('Failed to log activity:', logError.message);
      }
      
      // Response message
      const message = emailSent 
        ? 'Registration successful. Please verify your email.' 
        : 'Registration successful.';
      
      res.status(201).json({
        success: true,
        message: message,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          tokens
        }
      });
    } catch (error) {
      console.error('Registration error:', error.message);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages
        });
      }
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
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
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          tokens
        }
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Forgot password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // For security, don't reveal if user exists
        return res.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
      
      await user.save();
      
      // Send reset email
      try {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        await emailUtil.sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailError) {
        console.warn('Failed to send password reset email:', emailError.message);
      }
      
      res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    } catch (error) {
      console.error('Forgot password error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Update password
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Password reset failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      console.error('Token refresh error:', error.message);
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * Logout
   */
  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
  
  /**
   * OAuth callback
   */
  async oauthCallback(req, res) {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
      }
      
      const tokens = jwt.generateTokens(req.user);
      
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error.message);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
}

module.exports = new AuthController();