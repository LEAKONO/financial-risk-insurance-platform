const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const validate = require('../middleware/validation.middleware');
const { 
  registerValidator,  // ← Changed from registerValidation
  loginValidator,     // ← Changed from loginValidation
  forgotPasswordValidator,
  resetPasswordValidator 
} = require('../validators/auth.validator');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working!',
    timestamp: new Date().toISOString()
  });
});

// Register route - use registerValidator
router.post('/register', validate(registerValidator), (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Simple validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  res.json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: 'user_' + Date.now(),
        email,
        firstName,
        lastName,
        role: 'customer',
        createdAt: new Date().toISOString()
      },
      token: 'jwt_token_' + Date.now(),
      refreshToken: 'refresh_token_' + Date.now()
    }
  });
});

// Login route - use loginValidator
router.post('/login', validate(loginValidator), (req, res) => {
  const { email, password } = req.body;
  
  // Simple authentication (for testing)
  if (email === 'test@example.com' && password === 'password123') {
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 'user_123456',
          email,
          firstName: 'Test',
          lastName: 'User',
          role: 'customer',
          lastLogin: new Date().toISOString()
        },
        tokens: {
          accessToken: 'jwt_access_token_' + Date.now(),
          refreshToken: 'jwt_refresh_token_' + Date.now()
        }
      }
    });
  }
  
  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Forgot password - use forgotPasswordValidator
router.post('/forgot-password', validate(forgotPasswordValidator), (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  res.json({
    success: true,
    message: 'Password reset email sent (simulated)'
  });
});

// Reset password - use resetPasswordValidator
router.post('/reset-password/:token', validate(resetPasswordValidator), (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }
  
  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// ... rest of the routes remain the same

module.exports = router;