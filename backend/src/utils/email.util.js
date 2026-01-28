const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger.util');

// Check if SMTP is properly configured
const isSmtpConfigured = () => {
  return process.env.SMTP_USER && 
         process.env.SMTP_PASS && 
         process.env.SMTP_USER.trim() !== '' && 
         process.env.SMTP_PASS.trim() !== '';
};

let transporter;
let smtpReady = false;

// Initialize transporter
const initTransporter = () => {
  if (!isSmtpConfigured()) {
    logger.warn('SMTP not configured. Email functionality disabled.');
    return;
  }
  
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Greeting timeout
      greetingTimeout: 10000,
      // Socket timeout
      socketTimeout: 10000
    });
    
    // Test connection
    transporter.verify((error) => {
      if (error) {
        logger.error(`SMTP connection error: ${error.message}`);
        smtpReady = false;
        
        // Log helpful debug info
        if (error.code === 'EAUTH') {
          logger.error('Authentication failed. Check:');
          logger.error('1. Is 2-Step Verification enabled in Google Account?');
          logger.error('2. Did you use App Password (not your regular password)?');
          logger.error('3. Is "Less secure app access" enabled?');
        } else if (error.code === 'ECONNECTION') {
          logger.error('Connection failed. Check:');
          logger.error('1. Is SMTP_HOST correct? (smtp.gmail.com for Gmail)');
          logger.error('2. Is SMTP_PORT correct? (587 for Gmail)');
          logger.error('3. Is internet connection working?');
        }
      } else {
        smtpReady = true;
        logger.info('✅ SMTP connection established');
      }
    });
  } catch (error) {
    logger.error(`Failed to create SMTP transporter: ${error.message}`);
    smtpReady = false;
  }
};

// Initialize on require
initTransporter();

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} verificationUrl - Verification URL
 * @returns {Promise}
 */
const sendVerificationEmail = async (email, verificationUrl) => {
  if (!smtpReady || !transporter) {
    logger.warn(`Cannot send verification email: SMTP not ready`);
    throw new Error('SMTP not configured or not ready');
  }
  
  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Financial Risk Insurance!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p>This verification link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Financial Risk Insurance. Please do not reply to this email.
        </p>
      </div>
    `,
    // Text version for email clients that don't support HTML
    text: `Welcome to Financial Risk Insurance!\n\nPlease verify your email address by visiting this link:\n${verificationUrl}\n\nThis verification link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Verification email sent to ${email}`);
    logger.debug(`Email ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send verification email to ${email}: ${error.message}`);
    
    // More detailed error logging
    if (error.responseCode === 535) {
      logger.error('Authentication error - check your SMTP credentials');
    } else if (error.responseCode === 553) {
      logger.error('From address rejected - check FROM_EMAIL');
    }
    
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise}
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!smtpReady || !transporter) {
    logger.warn(`Cannot send password reset email: SMTP not ready`);
    throw new Error('SMTP not configured or not ready');
  }
  
  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p>This password reset link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
    text: `Password Reset Request\n\nWe received a request to reset your password. Visit this link to create a new password:\n${resetUrl}\n\nThis password reset link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Password reset email sent to ${email}`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send password reset email to ${email}: ${error.message}`);
    throw error;
  }
};

/**
 * Send claim status update email
 * @param {string} email - Recipient email
 * @param {Object} claim - Claim details
 * @returns {Promise}
 */
const sendClaimStatusEmail = async (email, claim) => {
  if (!smtpReady || !transporter) {
    logger.warn(`Cannot send claim status email: SMTP not ready`);
    return;
  }
  
  const statusMessages = {
    'approved': 'Your claim has been approved!',
    'rejected': 'Your claim has been rejected',
    'under-review': 'Your claim is under review',
    'paid': 'Your claim has been paid',
    'documentation-required': 'Additional documentation required'
  };

  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: `Claim Update: ${statusMessages[claim.status] || 'Status Updated'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Claim Update</h1>
        <p>Your claim <strong>${claim.claimNumber}</strong> status has been updated to <strong>${claim.status}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Claim Details:</h3>
          <p><strong>Claim Number:</strong> ${claim.claimNumber}</p>
          <p><strong>Type:</strong> ${claim.type}</p>
          <p><strong>Claimed Amount:</strong> $${claim.claimedAmount?.toLocaleString() || '0'}</p>
          <p><strong>Status:</strong> ${claim.status}</p>
          ${claim.approvedAmount ? `<p><strong>Approved Amount:</strong> $${claim.approvedAmount.toLocaleString()}</p>` : ''}
          ${claim.rejectionReason ? `<p><strong>Reason:</strong> ${claim.rejectionReason}</p>` : ''}
        </div>
        
        <p>You can view the complete details of your claim by logging into your account.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Claim status email sent to ${email} for claim ${claim.claimNumber}`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send claim status email: ${error.message}`);
  }
};

/**
 * Send policy creation email
 * @param {string} email - Recipient email
 * @param {Object} policy - Policy details
 * @returns {Promise}
 */
const sendPolicyCreationEmail = async (email, policy) => {
  if (!smtpReady || !transporter) {
    logger.warn(`Cannot send policy creation email: SMTP not ready`);
    return;
  }
  
  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Insurance Policy ${policy.policyNumber || policy._id} Has Been Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Policy Confirmation</h1>
        <p>Congratulations! Your insurance policy has been successfully created.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Policy Details:</h3>
          <p><strong>Policy Number:</strong> ${policy.policyNumber || policy._id}</p>
          <p><strong>Policy Name:</strong> ${policy.name}</p>
          ${policy.totalPremium ? `<p><strong>Total Premium:</strong> $${policy.totalPremium.toLocaleString()}/year</p>` : ''}
          <p><strong>Status:</strong> ${policy.status}</p>
        </div>
        
        <p>You can view and manage your policy by logging into your account.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Policy creation email sent to ${email} for policy ${policy.policyNumber || policy._id}`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send policy creation email: ${error.message}`);
  }
};

// Export functions
module.exports = {
  isSmtpConfigured: () => smtpReady,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendClaimStatusEmail,
  sendPolicyCreationEmail
};