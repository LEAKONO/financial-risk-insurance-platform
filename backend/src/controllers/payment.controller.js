const Policy = require('../models/Policy');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');

class PaymentController {
  /**
   * Process premium payment
   */
  async processPayment(req, res) {
    try {
      const {
        policyId,
        amount,
        paymentMethodId,
        paymentMethodType = 'card', // card, bank_account, etc.
        savePaymentMethod = false
      } = req.body;

      // Validate required fields
      if (!policyId || !amount || !paymentMethodId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: policyId, amount, paymentMethodId'
        });
      }

      // Check if policy exists and belongs to user
      const policy = await Policy.findOne({
        _id: policyId,
        user: req.user._id
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found or access denied'
        });
      }

      // Check if policy is active
      if (policy.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Cannot pay for ${policy.status} policy`
        });
      }

      // Simulate payment processing
      // In real app, integrate with Stripe/PayPal
      const paymentResult = await this.processWithPaymentGateway({
        amount,
        paymentMethodId,
        paymentMethodType,
        customerId: req.user._id.toString(),
        description: `Premium payment for policy ${policy.policyNumber}`
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: paymentResult.message || 'Payment failed'
        });
      }

      // Update policy with payment info
      const lastPaymentIndex = policy.premiumSchedule.findIndex(
        schedule => !schedule.paid && schedule.dueDate <= new Date()
      );

      if (lastPaymentIndex !== -1) {
        policy.premiumSchedule[lastPaymentIndex].paid = true;
        policy.premiumSchedule[lastPaymentIndex].paidDate = new Date();
        policy.premiumSchedule[lastPaymentIndex].paymentMethod = paymentMethodType;
        policy.premiumSchedule[lastPaymentIndex].transactionId = paymentResult.transactionId;
      }

      // Update next due date
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      // Add next payment if needed
      const hasNextPayment = policy.premiumSchedule.some(
        schedule => !schedule.paid && schedule.dueDate > new Date()
      );

      if (!hasNextPayment) {
        policy.premiumSchedule.push({
          frequency: policy.premiumSchedule[0]?.frequency || 'monthly',
          amount: policy.totalPremium / 12, // Monthly amount
          dueDate: nextDueDate,
          paid: false
        });
      }

      await policy.save();

      // Log activity
      await ActivityLog.create({
        user: req.user._id,
        action: 'premium_payment',
        entity: 'policy',
        entityId: policy._id,
        details: {
          policyNumber: policy.policyNumber,
          amount,
          transactionId: paymentResult.transactionId,
          paymentMethod: paymentMethodType
        }
      });

      // Send payment confirmation
      await this.sendPaymentConfirmation(req.user._id, policy, paymentResult);

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          transactionId: paymentResult.transactionId,
          amount,
          policyNumber: policy.policyNumber,
          receiptUrl: paymentResult.receiptUrl,
          nextPaymentDue: nextDueDate,
          paymentDate: new Date()
        }
      });
    } catch (error) {
      logger.error(`Process payment controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Payment processing failed'
      });
    }
  }

  /**
   * Simulate payment gateway integration
   */
  async processWithPaymentGateway(paymentData) {
    // In real app, this would integrate with Stripe, PayPal, etc.
    // For now, simulate successful payment
    
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receiptUrl: `https://example.com/receipts/${Date.now()}`,
      message: 'Payment authorized'
    };
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(userId, policy, paymentResult) {
    try {
      // In real app, send email
      console.log(`Payment confirmation sent for policy ${policy.policyNumber}`);
      
      await ActivityLog.create({
        user: userId,
        action: 'payment_confirmation_sent',
        entity: 'payment',
        entityId: paymentResult.transactionId,
        details: {
          policyNumber: policy.policyNumber,
          amount: paymentResult.amount,
          sentVia: 'email'
        }
      });
    } catch (error) {
      console.error('Failed to send payment confirmation:', error.message);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req, res) {
    try {
      const { policyId } = req.query;
      
      let query = { user: req.user._id };
      if (policyId) query._id = policyId;

      const policies = await Policy.find(query);

      // Extract payment history from premium schedules
      const paymentHistory = [];
      
      policies.forEach(policy => {
        policy.premiumSchedule.forEach(schedule => {
          if (schedule.paid && schedule.paidDate) {
            paymentHistory.push({
              policyNumber: policy.policyNumber,
              policyName: policy.name,
              amount: schedule.amount,
              date: schedule.paidDate,
              transactionId: schedule.transactionId,
              paymentMethod: schedule.paymentMethod || 'card',
              status: 'paid',
              receiptUrl: `https://example.com/receipts/${schedule.transactionId}`
            });
          }
        });
      });

      // Sort by date (newest first)
      paymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json({
        success: true,
        data: {
          payments: paymentHistory,
          total: paymentHistory.length,
          totalAmount: paymentHistory.reduce((sum, payment) => sum + payment.amount, 0)
        }
      });
    } catch (error) {
      logger.error(`Get payment history controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment history'
      });
    }
  }

  /**
   * Setup payment method (save card/bank for future payments)
   */
  async setupPaymentMethod(req, res) {
    try {
      const { paymentMethodId, type = 'card', isDefault = false } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          message: 'Payment method ID is required'
        });
      }

      // In real app, save to Stripe Customer
      // For now, simulate success
      
      res.json({
        success: true,
        message: 'Payment method added successfully',
        data: {
          paymentMethodId,
          type,
          isDefault,
          last4: '4242', // Example
          brand: type === 'card' ? 'visa' : 'bank',
          expiresAt: type === 'card' ? '12/2025' : null
        }
      });
    } catch (error) {
      logger.error(`Setup payment method controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to setup payment method'
      });
    }
  }
}

module.exports = new PaymentController();