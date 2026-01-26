const RiskProfile = require('../models/RiskProfile');
const PremiumService = require('./premium.service');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');
class RiskService {
  /**
   * Create or update risk profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Risk profile data
   * @returns {Promise<Object>} Created/updated risk profile
   */
  async createOrUpdateRiskProfile(userId, profileData) {
    try {
      // Check for existing profile
      let riskProfile = await RiskProfile.findOne({ user: userId });
      
      const profileFields = {
        ...profileData,
        user: userId,
        lastUpdated: new Date()
      };
      
      if (riskProfile) {
        // Update existing profile
        Object.assign(riskProfile, profileFields);
      } else {
        // Create new profile
        riskProfile = new RiskProfile(profileFields);
      }
      
      // Calculate risk factors
      await this.calculateRiskFactors(riskProfile);
      
      // Calculate overall risk score
      await this.calculateRiskScore(riskProfile);
      
      // Calculate premium multiplier
      riskProfile.basePremiumMultiplier = PremiumService.calculateRiskMultiplier(riskProfile);
      
      riskProfile.isComplete = this.isProfileComplete(riskProfile);
      await riskProfile.save();
      
      // Log activity 
      await ActivityLog.create({
        user: userId,
        action: riskProfile._id ? 'update' : 'create',
        entity: 'risk-profile',
        entityId: riskProfile._id,
        details: {
          riskScore: riskProfile.overallRiskScore,
          riskCategory: riskProfile.riskCategory,
          multiplier: riskProfile.basePremiumMultiplier
        }
      });
      
      return riskProfile;
    } catch (error) {
      logger.error(`Create/update risk profile error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Calculate individual risk factors
   * @param {Object} riskProfile - Risk profile object
   */
  async calculateRiskFactors(riskProfile) {
    try {
      const factors = [];
      
      // Age factor
      if (riskProfile.age) {
        let ageRisk = 'low';
        if (riskProfile.age > 60) ageRisk = 'high';
        else if (riskProfile.age > 45) ageRisk = 'medium';
        
        const ageMultiplier = {
          'low': 1.0,
          'medium': 1.2,
          'high': 1.5
        }[ageRisk];
        
        factors.push({
          category: 'health',
          factor: 'age',
          level: ageRisk,
          multiplier: ageMultiplier,
          description: `Age ${riskProfile.age} - ${ageRisk} risk`
        });
      }
      
      // Occupation factor
      const occupationConfig = {
        'hazardous': { level: 'very-high', multiplier: 2.0 },
        'manual': { level: 'high', multiplier: 1.5 },
        'healthcare': { level: 'medium', multiplier: 1.2 },
        'unemployed': { level: 'medium', multiplier: 1.3 },
        'professional': { level: 'low', multiplier: 0.9 },
        'administrative': { level: 'low', multiplier: 1.0 },
        'education': { level: 'low', multiplier: 0.9 },
        'technology': { level: 'low', multiplier: 0.8 },
        'finance': { level: 'low', multiplier: 0.9 }
      };
      
      if (riskProfile.occupation && occupationConfig[riskProfile.occupation]) {
        const config = occupationConfig[riskProfile.occupation];
        factors.push({
          category: 'occupation',
          factor: 'occupation_type',
          level: config.level,
          multiplier: config.multiplier,
          description: `${riskProfile.occupation} occupation - ${config.level} risk`
        });
      }
      
      // Health factors
      if (riskProfile.hasChronicIllness) {
        factors.push({
          category: 'health',
          factor: 'chronic_illness',
          level: 'high',
          multiplier: 1.5,
          description: 'Chronic illness present'
        });
      }
      
      if (riskProfile.smoker) {
        factors.push({
          category: 'lifestyle',
          factor: 'smoking',
          level: 'high',
          multiplier: 1.5,
          description: 'Smoker'
        });
      }
      
      if (riskProfile.bmi) {
        let bmiRisk = 'low';
        if (riskProfile.bmi < 18.5 || riskProfile.bmi > 30) {
          bmiRisk = 'high';
        } else if (riskProfile.bmi > 25) {
          bmiRisk = 'medium';
        }
        
        const bmiMultiplier = {
          'low': 1.0,
          'medium': 1.1,
          'high': 1.3
        }[bmiRisk];
        
        factors.push({
          category: 'health',
          factor: 'bmi',
          level: bmiRisk,
          multiplier: bmiMultiplier,
          description: `BMI ${riskProfile.bmi} - ${bmiRisk} risk`
        });
      }
      
      // Lifestyle factors
      if (riskProfile.hasDangerousHobbies) {
        factors.push({
          category: 'lifestyle',
          factor: 'dangerous_hobbies',
          level: 'high',
          multiplier: 1.4,
          description: 'Participates in dangerous hobbies'
        });
      }
      
      // Financial factors
      if (riskProfile.hasBankruptcyHistory) {
        factors.push({
          category: 'financial',
          factor: 'bankruptcy_history',
          level: 'high',
          multiplier: 1.3,
          description: 'History of bankruptcy'
        });
      }
      
      if (riskProfile.creditScore) {
        let creditRisk = 'low';
        if (riskProfile.creditScore < 580) creditRisk = 'high';
        else if (riskProfile.creditScore < 670) creditRisk = 'medium';
        
        const creditMultiplier = {
          'low': 0.9,
          'medium': 1.2,
          'high': 1.5
        }[creditRisk];
        
        factors.push({
          category: 'financial',
          factor: 'credit_score',
          level: creditRisk,
          multiplier: creditMultiplier,
          description: `Credit score ${riskProfile.creditScore} - ${creditRisk} risk`
        });
      }
      
      // Geographic factors
      if (riskProfile.location?.riskZone) {
        const multiplier = {
          'low': 0.9,
          'medium': 1.0,
          'high': 1.3
        }[riskProfile.location.riskZone];
        
        factors.push({
          category: 'geographic',
          factor: 'location_risk',
          level: riskProfile.location.riskZone,
          multiplier,
          description: `${riskProfile.location.riskZone} risk location`
        });
      }
      
      riskProfile.riskFactors = factors;
    } catch (error) {
      logger.error(`Calculate risk factors error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Calculate overall risk score (0-100)
   * @param {Object} riskProfile - Risk profile object
   */
  async calculateRiskScore(riskProfile) {
    try {
      let score = 50; // Base score
      
      // Age adjustment
      if (riskProfile.age >= 60) score += 20;
      else if (riskProfile.age >= 45) score += 10;
      else if (riskProfile.age < 25) score += 5;
      
      // Occupation adjustment
      const occupationScores = {
        'hazardous': 30,
        'manual': 20,
        'healthcare': 10,
        'unemployed': 15,
        'professional': -5,
        'administrative': -5,
        'education': -10,
        'technology': -10,
        'finance': -5
      };
      
      if (occupationScores[riskProfile.occupation]) {
        score += occupationScores[riskProfile.occupation];
      }
      
      // Health adjustments
      if (riskProfile.hasChronicIllness) score += 15;
      if (riskProfile.smoker) score += 20;
      if (riskProfile.bmi && (riskProfile.bmi < 18.5 || riskProfile.bmi > 30)) score += 10;
      
      // Lifestyle adjustments
      if (riskProfile.hasDangerousHobbies) score += 15;
      
      // Financial adjustments
      if (riskProfile.hasBankruptcyHistory) score += 25;
      if (riskProfile.creditScore) {
        if (riskProfile.creditScore < 580) score += 20;
        else if (riskProfile.creditScore < 670) score += 10;
        else if (riskProfile.creditScore >= 740) score -= 10;
      }
      
      // Geographic adjustments
      if (riskProfile.location?.riskZone === 'high') score += 15;
      else if (riskProfile.location?.riskZone === 'low') score -= 10;
      
      // Income adjustment (lower income = higher risk)
      if (riskProfile.annualIncome) {
        if (riskProfile.annualIncome < 30000) score += 10;
        else if (riskProfile.annualIncome > 100000) score -= 10;
      }
      
      // Cap score between 0 and 100
      score = Math.max(0, Math.min(score, 100));
      
      riskProfile.overallRiskScore = Math.round(score);
      
      // Determine risk category
      if (score >= 75) riskProfile.riskCategory = 'very-high';
      else if (score >= 60) riskProfile.riskCategory = 'high';
      else if (score >= 40) riskProfile.riskCategory = 'moderate';
      else riskProfile.riskCategory = 'low';
    } catch (error) {
      logger.error(`Calculate risk score error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Check if profile is complete
   * @param {Object} riskProfile - Risk profile object
   * @returns {boolean} True if complete
   */
  isProfileComplete(riskProfile) {
    const requiredFields = [
      'age',
      'occupation',
      'annualIncome',
      'employmentStatus'
    ];
    
    return requiredFields.every(field => 
      riskProfile[field] !== undefined && riskProfile[field] !== null
    );
  }
  
  /**
   * Get risk profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Risk profile
   */
  async getRiskProfile(userId) {
    try {
      const riskProfile = await RiskProfile.findOne({ user: userId });
      
      if (!riskProfile) {
        throw new Error('Risk profile not found');
      }
      
      return riskProfile;
    } catch (error) {
      logger.error(`Get risk profile error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Calculate premium based on risk profile and policy details
   * @param {string} userId - User ID
   * @param {Object} policyData - Policy data
   * @returns {Promise<Object>} Premium calculation result
   */
  async calculatePremium(userId, policyData) {
    try {
      const { policyType, coverageAmount, termLength = 12, premiumFrequency = 'monthly' } = policyData;
      
      // Get risk profile
      const riskProfile = await this.getRiskProfile(userId);
      
      if (!riskProfile.isComplete) {
        throw new Error('Complete risk profile required for premium calculation');
      }
      
      // Calculate risk multiplier
      const riskMultiplier = PremiumService.calculateRiskMultiplier(riskProfile);
      
      // Calculate base and total premium
      const basePremium = PremiumService.calculateBasePremium(policyType, coverageAmount);
      const totalPremium = PremiumService.calculateTotalPremium(policyType, coverageAmount, riskMultiplier);
      
      // Generate premium schedule
      const premiumSchedule = PremiumService.generatePremiumSchedule(
        totalPremium,
        premiumFrequency
      );
      
      // Calculate annual equivalent
      const annualPremium = premiumFrequency === 'monthly' ? totalPremium * 12 :
                           premiumFrequency === 'quarterly' ? totalPremium * 4 :
                           premiumFrequency === 'semi-annual' ? totalPremium * 2 :
                           totalPremium;
      
      return {
        riskProfile: {
          score: riskProfile.overallRiskScore,
          category: riskProfile.riskCategory,
          multiplier: riskMultiplier
        },
        calculation: {
          policyType,
          coverageAmount,
          basePremium,
          riskMultiplier,
          totalPremium,
          annualPremium,
          premiumFrequency,
          termLength
        },
        premiumSchedule,
        breakdown: {
          base: basePremium,
          riskAdjustment: (riskMultiplier - 1) * basePremium,
          total: totalPremium
        }
      };
    } catch (error) {
      logger.error(`Calculate premium error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get risk analysis summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Risk analysis summary
   */
  async getRiskAnalysis(userId) {
    try {
      const riskProfile = await this.getRiskProfile(userId);
      
      if (!riskProfile.isComplete) {
        throw new Error('Complete risk profile required for analysis');
      }
      
      // Categorize risk factors
      const categories = {
        health: [],
        occupation: [],
        lifestyle: [],
        financial: [],
        geographic: []
      };
      
      riskProfile.riskFactors.forEach(factor => {
        if (categories[factor.category]) {
          categories[factor.category].push(factor);
        }
      });
      
      // Calculate category scores
      const categoryScores = {};
      Object.keys(categories).forEach(category => {
        const factors = categories[category];
        if (factors.length > 0) {
          const avgMultiplier = factors.reduce((sum, f) => sum + f.multiplier, 0) / factors.length;
          categoryScores[category] = {
            count: factors.length,
            averageMultiplier: avgMultiplier,
            riskLevel: avgMultiplier >= 1.5 ? 'high' : avgMultiplier >= 1.2 ? 'medium' : 'low'
          };
        }
      });
      
      // Recommendations based on risk factors
      const recommendations = [];
      
      if (riskProfile.smoker) {
        recommendations.push({
          category: 'lifestyle',
          recommendation: 'Consider quitting smoking to reduce health risk',
          impact: 'Could reduce premium by up to 15%'
        });
      }
      
      if (riskProfile.hasChronicIllness) {
        recommendations.push({
          category: 'health',
          recommendation: 'Regular health check-ups and medication adherence',
          impact: 'Could improve risk assessment over time'
        });
      }
      
      if (riskProfile.creditScore && riskProfile.creditScore < 670) {
        recommendations.push({
          category: 'financial',
          recommendation: 'Improve credit score through timely payments',
          impact: 'Could reduce premium by up to 10%'
        });
      }
      
      if (riskProfile.hasDangerousHobbies) {
        recommendations.push({
          category: 'lifestyle',
          recommendation: 'Consider additional safety measures or insurance riders',
          impact: 'Better coverage for specific risks'
        });
      }
      
      return {
        profile: {
          score: riskProfile.overallRiskScore,
          category: riskProfile.riskCategory,
          multiplier: riskProfile.basePremiumMultiplier,
          completeness: riskProfile.isComplete
        },
        categories: categoryScores,
        factors: categories,
        recommendations,
        lastUpdated: riskProfile.lastUpdated
      };
    } catch (error) {
      logger.error(`Get risk analysis error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Compare user's risk profile with average
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Comparison data
   */
  async compareWithAverage(userId) {
    try {
      const userProfile = await this.getRiskProfile(userId);
      
      if (!userProfile.isComplete) {
        throw new Error('Complete risk profile required for comparison');
      }
      
      // Get average risk scores from database
      const averages = await RiskProfile.aggregate([
        { $match: { isComplete: true } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$overallRiskScore' },
            avgAge: { $avg: '$age' },
            avgIncome: { $avg: '$annualIncome' }
          }
        }
      ]);
      
      const averageData = averages[0] || { avgScore: 50, avgAge: 40, avgIncome: 60000 };
      
      // Calculate percentile
      const allScores = await RiskProfile.find({ isComplete: true })
        .select('overallRiskScore')
        .lean();
      
      const userScore = userProfile.overallRiskScore;
      const lowerScores = allScores.filter(profile => profile.overallRiskScore < userScore).length;
      const percentile = (lowerScores / allScores.length) * 100;
      
      return {
        user: {
          score: userScore,
          category: userProfile.riskCategory,
          age: userProfile.age,
          income: userProfile.annualIncome,
          multiplier: userProfile.basePremiumMultiplier
        },
        average: {
          score: Math.round(averageData.avgScore),
          age: Math.round(averageData.avgAge),
          income: Math.round(averageData.avgIncome),
          multiplier: 1.0 // Base multiplier
        },
        comparison: {
          scoreDifference: userScore - Math.round(averageData.avgScore),
          percentile: Math.round(percentile),
          premiumImpact: ((userProfile.basePremiumMultiplier - 1) * 100).toFixed(1) + '%'
        }
      };
    } catch (error) {
      logger.error(`Compare with average error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new RiskService();