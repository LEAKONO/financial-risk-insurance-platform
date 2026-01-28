const jwt = require('jsonwebtoken');
const User = require('../models/User');

class JwtUtil {
  /**
   * Generate JWT tokens for a user
   */
  static generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
    
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-secret', {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    });
    
    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      return jwt.verify(token, secret);
    } catch (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      
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
      
      const newTokens = this.generateTokens(user);
      
      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Token refresh error:', error.message);
      throw error;
    }
  }
}

module.exports = JwtUtil;