const constants = require('../config/constants');

class PremiumService {
  /**
   * Calculate base premium based on policy type and coverage
   */
  calculateBasePremium(policyType, coverageAmount) {
    const policyConfig = constants.POLICY_TYPES[policyType.toUpperCase()];
    
    if (!policyConfig) {
      throw new Error(`Invalid policy type: ${policyType}`);
    }
    
    return policyConfig.basePremium + (coverageAmount * policyConfig.coverageMultiplier);
  }
  
  /**
   * Calculate risk multiplier based on risk profile
   */
  calculateRiskMultiplier(riskProfile) {
    let multiplier = 1.0;
    
    // Age multiplier
    if (riskProfile.age >= 18 && riskProfile.age <= 25) {
      multiplier *= constants.RISK_MULTIPLIERS.AGE['18-25'];
    } else if (riskProfile.age <= 40) {
      multiplier *= constants.RISK_MULTIPLIERS.AGE['26-40'];
    } else if (riskProfile.age <= 55) {
      multiplier *= constants.RISK_MULTIPLIERS.AGE['41-55'];
    } else if (riskProfile.age <= 65) {
      multiplier *= constants.RISK_MULTIPLIERS.AGE['56-65'];
    } else {
      multiplier *= constants.RISK_MULTIPLIERS.AGE['66+'];
    }
    
    // Occupation multiplier
    multiplier *= constants.RISK_MULTIPLIERS.OCCUPATION[riskProfile.occupation] || 1.0;
    
    // Income multiplier
    if (riskProfile.annualIncome <= 30000) {
      multiplier *= constants.RISK_MULTIPLIERS.INCOME['0-30000'];
    } else if (riskProfile.annualIncome <= 60000) {
      multiplier *= constants.RISK_MULTIPLIERS.INCOME['30001-60000'];
    } else if (riskProfile.annualIncome <= 100000) {
      multiplier *= constants.RISK_MULTIPLIERS.INCOME['60001-100000'];
    } else if (riskProfile.annualIncome <= 200000) {
      multiplier *= constants.RISK_MULTIPLIERS.INCOME['100001-200000'];
    } else {
      multiplier *= constants.RISK_MULTIPLIERS.INCOME['200001+'];
    }
    
    // Health factors
    if (riskProfile.hasChronicIllness) {
      multiplier *= 1.3;
    }
    
    if (riskProfile.smoker) {
      multiplier *= 1.5;
    }
    
    if (riskProfile.bmi) {
      if (riskProfile.bmi < 18.5 || riskProfile.bmi > 30) {
        multiplier *= 1.2;
      }
    }
    
    // Lifestyle factors
    if (riskProfile.hasDangerousHobbies) {
      multiplier *= 1.4;
    }
    
    // Financial factors
    if (riskProfile.hasBankruptcyHistory) {
      multiplier *= 1.3;
    }
    
    if (riskProfile.creditScore) {
      if (riskProfile.creditScore < 580) {
        multiplier *= 1.5;
      } else if (riskProfile.creditScore < 670) {
        multiplier *= 1.2;
      } else if (riskProfile.creditScore >= 740) {
        multiplier *= 0.9;
      }
    }
    
    // Geographic factors
    if (riskProfile.location?.riskZone === 'high') {
      multiplier *= 1.3;
    } else if (riskProfile.location?.riskZone === 'low') {
      multiplier *= 0.9;
    }
    
    // Cap multiplier between 0.5 and 3.0
    return Math.max(0.5, Math.min(multiplier, 3.0));
  }
  
  /**
   * Calculate total premium
   */
  calculateTotalPremium(policyType, coverageAmount, riskMultiplier) {
    const basePremium = this.calculateBasePremium(policyType, coverageAmount);
    return basePremium * riskMultiplier;
  }
  
  /**
   * Generate premium schedule
   */
  generatePremiumSchedule(totalPremium, frequency = 'monthly', startDate = new Date()) {
    const schedule = [];
    const frequencies = {
      'monthly': 12,
      'quarterly': 4,
      'semi-annual': 2,
      'annual': 1
    };
    
    const installments = frequencies[frequency];
    const installmentAmount = totalPremium / installments;
    const dueDate = new Date(startDate);
    
    for (let i = 0; i < installments; i++) {
      schedule.push({
        frequency,
        amount: parseFloat(installmentAmount.toFixed(2)),
        dueDate: new Date(dueDate),
        paid: false
      });
      
      if (frequency === 'monthly') {
        dueDate.setMonth(dueDate.getMonth() + 1);
      } else if (frequency === 'quarterly') {
        dueDate.setMonth(dueDate.getMonth() + 3);
      } else if (frequency === 'semi-annual') {
        dueDate.setMonth(dueDate.getMonth() + 6);
      } else {
        dueDate.setFullYear(dueDate.getFullYear() + 1);
      }
    }
    
    return schedule;
  }
}

module.exports = new PremiumService();