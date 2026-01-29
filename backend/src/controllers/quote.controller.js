const RiskProfile = require('../models/RiskProfile');
const { logger } = require('../utils/logger.util');

class QuoteController {
  /**
   * Get insurance quote
   */
  getQuote = async (req, res) => {
    try {
      const {
        policyType = 'life',
        coverageAmount = 100000,
        termLength = 20, // years
        age,
        occupation,
        isSmoker = false,
        hasChronicIllness = false,
        annualIncome,
        creditScore
      } = req.body;

      // If user is authenticated, use their risk profile
      let riskMultiplier = 1.0;
      let riskScore = 50;

      if (req.user) {
        const riskProfile = await RiskProfile.findOne({ user: req.user._id });
        if (riskProfile && riskProfile.isComplete) {
          riskMultiplier = riskProfile.basePremiumMultiplier || 1.0;
          riskScore = riskProfile.overallRiskScore || 50;
        } else {
          // Calculate based on request data
          riskMultiplier = this.calculateRiskMultiplier({
            age,
            occupation,
            isSmoker,
            hasChronicIllness,
            annualIncome,
            creditScore
          });
          riskScore = this.calculateRiskScore(riskMultiplier);
        }
      } else {
        // For unauthenticated users (public quote)
        riskMultiplier = this.calculateRiskMultiplier({
          age,
          occupation,
          isSmoker,
          hasChronicIllness,
          annualIncome,
          creditScore
        });
        riskScore = this.calculateRiskScore(riskMultiplier);
      }

      // Base premium calculation
      const basePremium = this.calculateBasePremium(policyType, coverageAmount, termLength);
      
      // Apply risk multiplier
      const totalPremium = basePremium * riskMultiplier;
      
      // Monthly premium (divide by 12 for monthly, by term for annual)
      const monthlyPremium = totalPremium / (termLength * 12);
      const annualPremium = totalPremium / termLength;

      const quote = {
        policyType,
        coverageAmount,
        termLength,
        basePremium: Math.round(basePremium),
        totalPremium: Math.round(totalPremium),
        monthlyPremium: Math.round(monthlyPremium),
        annualPremium: Math.round(annualPremium),
        riskMultiplier: parseFloat(riskMultiplier.toFixed(2)),
        riskScore,
        riskCategory: this.getRiskCategory(riskScore),
        quoteId: `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        calculation: {
          formula: 'Base Premium × Risk Multiplier',
          explanation: `$${basePremium.toFixed(2)} × ${riskMultiplier.toFixed(2)} = $${totalPremium.toFixed(2)}`
        }
      };

      res.json({
        success: true,
        message: 'Quote generated successfully',
        data: quote
      });
    } catch (error) {
      logger.error(`Get quote controller error: ${error.message}`);
      console.error('Quote error details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate quote',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Calculate base premium based on policy type
   */
  calculateBasePremium = (policyType, coverageAmount, termLength) => {
    const baseRates = {
      life: 0.015,      // 1.5% of coverage annually
      health: 0.02,     // 2% of coverage annually
      auto: 0.025,      // 2.5% of coverage annually
      property: 0.018,  // 1.8% of coverage annually
      disability: 0.012 // 1.2% of coverage annually
    };

    const rate = baseRates[policyType] || baseRates.life;
    return coverageAmount * rate * termLength;
  }

  /**
   * Calculate risk multiplier based on factors
   */
  calculateRiskMultiplier = (factors = {}) => {
    let multiplier = 1.0;

    // Age factor (default to 35 if not provided)
    const age = factors.age || 35;
    if (age < 25) multiplier *= 1.3;
    else if (age <= 40) multiplier *= 1.0;
    else if (age <= 55) multiplier *= 1.2;
    else if (age <= 65) multiplier *= 1.5;
    else multiplier *= 2.0;

    // Occupation factor (default to professional)
    const occupationMultipliers = {
      hazardous: 2.0,
      manual: 1.5,
      healthcare: 1.2,
      professional: 0.9,
      technology: 0.8,
      unemployed: 1.8
    };
    const occupation = factors.occupation || 'professional';
    multiplier *= occupationMultipliers[occupation] || 1.0;

    // Health factors
    if (factors.isSmoker) multiplier *= 1.8;
    if (factors.hasChronicIllness) multiplier *= 1.5;

    // Financial factors
    const income = factors.annualIncome || 50000;
    if (income < 30000) multiplier *= 1.3;
    else if (income > 100000) multiplier *= 0.9;

    const credit = factors.creditScore || 700;
    if (credit < 580) multiplier *= 1.5;
    else if (credit >= 740) multiplier *= 0.9;

    // Ensure multiplier stays within bounds
    return Math.min(Math.max(multiplier, 0.5), 3.0);
  }

  /**
   * Calculate risk score from multiplier
   */
  calculateRiskScore = (multiplier) => {
    // Convert multiplier (0.5-3.0) to score (0-100)
    const score = ((multiplier - 0.5) / 2.5) * 100;
    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Get risk category from score
   */
  getRiskCategory = (score) => {
    if (score < 25) return 'Low';
    if (score < 50) return 'Below Average';
    if (score < 75) return 'Average';
    if (score < 90) return 'High';
    return 'Very High';
  }

  /**
   * Save quote (for logged-in users)
   */
  saveQuote = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to save quote'
        });
      }

      const { quoteData } = req.body;

      // In a real app, you'd save to a Quote model
      // For now, we'll just return success
      
      res.json({
        success: true,
        message: 'Quote saved successfully',
        data: {
          quoteId: quoteData?.quoteId || `QT-${Date.now()}`,
          savedAt: new Date(),
          userId: req.user._id
        }
      });
    } catch (error) {
      logger.error(`Save quote controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to save quote'
      });
    }
  }
}

module.exports = new QuoteController();