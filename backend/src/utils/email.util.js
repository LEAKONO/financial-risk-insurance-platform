const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger.util');
// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) {
    logger.error(`SMTP connection error: ${error.message}`);
  } else {
    logger.info('SMTP connection established');
  }
});

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} verificationUrl - Verification URL
 * @returns {Promise}
 */
const sendVerificationEmail = async (email, verificationUrl) => {
  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL}>`,
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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}: ${error.message}`);
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
  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL}>`,
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
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Financial Risk Insurance. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
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
  const statusMessages = {
    'approved': 'Your claim has been approved!',
    'rejected': 'Your claim has been rejected',
    'under-review': 'Your claim is under review',
    'paid': 'Your claim has been paid',
    'documentation-required': 'Additional documentation required'
  };

  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL}>`,
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
          <p><strong>Claimed Amount:</strong> $${claim.claimedAmount.toLocaleString()}</p>
          <p><strong>Status:</strong> ${claim.status}</p>
          ${claim.approvedAmount ? `<p><strong>Approved Amount:</strong> $${claim.approvedAmount.toLocaleString()}</p>` : ''}
          ${claim.rejectionReason ? `<p><strong>Reason:</strong> ${claim.rejectionReason}</p>` : ''}
        </div>
        
        <p>You can view the complete details of your claim by logging into your account.</p>
        <p>If you have any questions, please contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Financial Risk Insurance. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Claim status email sent to ${email} for claim ${claim.claimNumber}`);
  } catch (error) {
    logger.error(`Failed to send claim status email: ${error.message}`);
    throw error;
  }
};

/**
 * Send policy creation email
 * @param {string} email - Recipient email
 * @param {Object} policy - Policy details
 * @returns {Promise}
 */
const sendPolicyCreationEmail = async (email, policy) => {
  const mailOptions = {
    from: `"Financial Risk Insurance" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: `Your Insurance Policy ${policy.policyNumber} Has Been Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Policy Confirmation</h1>
        <p>Congratulations! Your insurance policy has been successfully created.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Policy Details:</h3>
          <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
          <p><strong>Policy Name:</strong> ${policy.name}</p>
          <p><strong>Total Premium:</strong> $${policy.totalPremium.toLocaleString()}/year</p>
          <p><strong>Coverage:</strong> $${policy.coverage.reduce((sum, cov) => sum + cov.coverageAmount, 0).toLocaleString()}</p>
          <p><strong>Start Date:</strong> ${new Date(policy.startDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${policy.status}</p>
        </div>
        
        <p>You can view and manage your policy by logging into your account.</p>
        <p>Your policy documents are available for download in your account dashboard.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from Financial Risk Insurance. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Policy creation email sent to ${email} for policy ${policy.policyNumber}`);
  } catch (error) {
    logger.error(`Failed to send policy creation email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  transporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendClaimStatusEmail,
  sendPolicyCreationEmail
};