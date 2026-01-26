const RiskService = require('../services/risk.service');
const PremiumService = require('../services/premium.service');
const { logger } = require('../utils/logger.util');
class RiskController {
  /**
   * Create or update risk profile
   */
  async createOrUpdateRiskProfile(req, res) {
    try {
      const riskProfile = await RiskService.createOrUpdateRiskProfile(
        req.user._id,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Risk profile saved successfully',
        data: riskProfile
      });
    } catch (error) {
      logger.error(`Create/update risk profile controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get user's risk profile
   */
  async getRiskProfile(req, res) {
    try {
      const riskProfile = await RiskService.getRiskProfile(req.user._id);
      
      res.json({
        success: true,
        data: riskProfile
      });
    } catch (error) {
      if (error.message === 'Risk profile not found') {
        return res.status(404).json({
          success: false,
          message: 'Risk profile not found. Please create one first.'
        });
      }
      
      logger.error(`Get risk profile controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load risk profile'
      });
    }
  }
  
  /**
   * Calculate premium
   */
  async calculatePremium(req, res) {
    try {
      const calculation = await RiskService.calculatePremium(
        req.user._id,
        req.body
      );
      
      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      logger.error(`Calculate premium controller error: ${error.message}`);
      res.status(error.message === 'Complete risk profile required for premium calculation' ? 400 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get risk analysis
   */
  async getRiskAnalysis(req, res) {
    try {
      const analysis = await RiskService.getRiskAnalysis(req.user._id);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      if (error.message === 'Complete risk profile required for analysis') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      logger.error(`Get risk analysis controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to generate risk analysis'
      });
    }
  }
  
  /**
   * Compare with average
   */
  async compareWithAverage(req, res) {
    try {
      const comparison = await RiskService.compareWithAverage(req.user._id);
      
      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      if (error.message === 'Complete risk profile required for comparison') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      logger.error(`Compare with average controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to generate comparison'
      });
    }
  }
  
  /**
   * Get risk factors (public endpoint)
   */
  async getRiskFactors(req, res) {
    try {
      // This could be from a database or configuration
      const riskFactors = {
        age: {
          description: 'Age affects insurance risk',
          ranges: [
            { range: '18-25', multiplier: 1.2, risk: 'Medium' },
            { range: '26-40', multiplier: 1.0, risk: 'Low' },
            { range: '41-55', multiplier: 1.1, risk: 'Medium' },
            { range: '56-65', multiplier: 1.3, risk: 'High' },
            { range: '66+', multiplier: 1.5, risk: 'Very High' }
          ]
        },
        occupation: {
          description: 'Occupation type impacts risk level',
          categories: [
            { name: 'Hazardous', multiplier: 2.0, risk: 'Very High' },
            { name: 'Manual Labor', multiplier: 1.5, risk: 'High' },
            { name: 'Healthcare', multiplier: 1.2, risk: 'Medium' },
            { name: 'Professional', multiplier: 0.9, risk: 'Low' },
            { name: 'Technology', multiplier: 0.8, risk: 'Low' }
          ]
        },
        health: {
          description: 'Health conditions affect risk assessment',
          factors: [
            { name: 'Smoking', multiplier: 1.5, impact: 'High' },
            { name: 'Chronic Illness', multiplier: 1.3, impact: 'Medium' },
            { name: 'High BMI', multiplier: 1.2, impact: 'Medium' }
          ]
        },
        financial: {
          description: 'Financial stability influences risk',
          factors: [
            { name: 'Low Credit Score (<580)', multiplier: 1.5, impact: 'High' },
            { name: 'Bankruptcy History', multiplier: 1.3, impact: 'Medium' },
            { name: 'High Income (>$100k)', multiplier: 0.9, impact: 'Low' }
          ]
        }
      };
      
      res.json({
        success: true,
        data: riskFactors
      });
    } catch (error) {
      logger.error(`Get risk factors controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load risk factors'
      });
    }
  }
  
  /**
   * Simulate premium based on different risk factors
   */
  async simulatePremium(req, res) {
    try {
      const { basePremium = 1000, factors = {} } = req.body;
      
      let multiplier = 1.0;
      const appliedFactors = [];
      
      // Apply age factor
      if (factors.age) {
        let ageMultiplier = 1.0;
        if (factors.age < 25) ageMultiplier = 1.2;
        else if (factors.age <= 40) ageMultiplier = 1.0;
        else if (factors.age <= 55) ageMultiplier = 1.1;
        else if (factors.age <= 65) ageMultiplier = 1.3;
        else ageMultiplier = 1.5;
        
        multiplier *= ageMultiplier;
        appliedFactors.push({
          factor: 'age',
          value: factors.age,
          multiplier: ageMultiplier,
          description: `Age ${factors.age}`
        });
      }
      
      // Apply occupation factor
      if (factors.occupation) {
        const occupationMultipliers = {
          'hazardous': 2.0,
          'manual': 1.5,
          'healthcare': 1.2,
          'professional': 0.9,
          'technology': 0.8,
          'default': 1.0
        };
        
        const occMultiplier = occupationMultipliers[factors.occupation] || occupationMultipliers.default;
        multiplier *= occMultiplier;
        appliedFactors.push({
          factor: 'occupation',
          value: factors.occupation,
          multiplier: occMultiplier,
          description: `${factors.occupation} occupation`
        });
      }
      
      // Apply health factors
      if (factors.smoker) {
        multiplier *= 1.5;
        appliedFactors.push({
          factor: 'smoking',
          value: true,
          multiplier: 1.5,
          description: 'Smoker'
        });
      }
      
      if (factors.hasChronicIllness) {
        multiplier *= 1.3;
        appliedFactors.push({
          factor: 'chronic_illness',
          value: true,
          multiplier: 1.3,
          description: 'Chronic illness'
        });
      }
      
      // Apply financial factors
      if (factors.creditScore) {
        let creditMultiplier = 1.0;
        if (factors.creditScore < 580) creditMultiplier = 1.5;
        else if (factors.creditScore < 670) creditMultiplier = 1.2;
        else if (factors.creditScore >= 740) creditMultiplier = 0.9;
        
        multiplier *= creditMultiplier;
        appliedFactors.push({
          factor: 'credit_score',
          value: factors.creditScore,
          multiplier: creditMultiplier,
          description: `Credit score ${factors.creditScore}`
        });
      }
      
      // Calculate final premium
      const finalPremium = basePremium * multiplier;
      
      res.json({
        success: true,
        data: {
          basePremium,
          finalPremium,
          multiplier,
          appliedFactors,
          calculation: `$${basePremium} × ${multiplier.toFixed(2)} = $${finalPremium.toFixed(2)}`
        }
      });
    } catch (error) {
      logger.error(`Simulate premium controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to simulate premium'
      });
    }
  }
}

module.exports = new RiskController();