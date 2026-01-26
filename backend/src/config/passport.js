const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { logger } = require('../utils/logger.util');
// Check if we should initialize OAuth strategies
const shouldInitializeOAuth = (provider) => {
  const envVar = `${provider.toUpperCase()}_CLIENT_ID`;
  const value = process.env[envVar];
  
  // Return false if empty, undefined, or contains placeholder text
  if (!value || 
      value.trim() === '' || 
      value.includes('your_') || 
      value.includes('placeholder')) {
    return false;
  }
  
  return true;
};

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        logger.info(`Local login attempt for: ${email}`);
        
        // For now, accept any login for testing
        // In production, you'll query the User model here
        const user = {
          id: 'temp_' + Date.now(),
          email: email,
          firstName: 'Test',
          lastName: 'User',
          role: 'customer'
        };
        
        return done(null, user);
      } catch (error) {
        logger.error(`Local authentication error: ${error.message}`);
        return done(error);
      }
    }
  )
);

// Conditionally load OAuth strategies ONLY if they're properly configured
try {
  // Google OAuth
  if (shouldInitializeOAuth('google')) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}${process.env.GOOGLE_CALLBACK_URL}`,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        logger.info(`Google OAuth for: ${profile.emails?.[0]?.value}`);
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          provider: 'google'
        };
        return done(null, user);
      }
    ));
    logger.info('✅ Google OAuth strategy initialized');
  }
} catch (error) {
  logger.warn(`⚠️  Google OAuth not configured: ${error.message}`);
}

try {
  // Facebook OAuth
  if (shouldInitializeOAuth('facebook')) {
    const FacebookStrategy = require('passport-facebook').Strategy;
    
    passport.use(new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}${process.env.FACEBOOK_CALLBACK_URL}`,
        profileFields: ['id', 'emails', 'name']
      },
      async (accessToken, refreshToken, profile, done) => {
        logger.info(`Facebook OAuth for: ${profile.emails?.[0]?.value}`);
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          provider: 'facebook'
        };
        return done(null, user);
      }
    ));
    logger.info('✅ Facebook OAuth strategy initialized');
  }
} catch (error) {
  logger.warn(`⚠️  Facebook OAuth not configured: ${error.message}`);
}

try {
  // GitHub OAuth
  if (shouldInitializeOAuth('github')) {
    const GitHubStrategy = require('passport-github2').Strategy;
    
    passport.use(new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}${process.env.GITHUB_CALLBACK_URL}`,
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        logger.info(`GitHub OAuth for: ${profile.username}`);
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.displayName?.split(' ')[0],
          lastName: profile.displayName?.split(' ').slice(1).join(' '),
          provider: 'github'
        };
        return done(null, user);
      }
    ));
    logger.info('✅ GitHub OAuth strategy initialized');
  }
} catch (error) {
  logger.warn(`⚠️  GitHub OAuth not configured: ${error.message}`);
}

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    // For testing, return a simple user object
    // In production, query database here
    const user = {
      id: id,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    };
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;