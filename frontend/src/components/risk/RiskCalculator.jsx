import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, TrendingUp, TrendingDown, 
  AlertCircle, Shield, RefreshCw, Download,
  Heart, Home, Car, Briefcase, User
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Slider } from '@/components/ui/Form/Slider';
import { Select } from '@/components/ui/Form/Select';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { riskService } from '@/services/api';

const ageGroups = [
  { value: '18-25', label: '18-25', risk: 1.2 },
  { value: '26-40', label: '26-40', risk: 1.0 },
  { value: '41-55', label: '41-55', risk: 1.1 },
  { value: '56-65', label: '56-65', risk: 1.3 },
  { value: '66+', label: '66+', risk: 1.5 }
];

const occupationOptions = [
  { value: 'professional', label: 'Professional', risk: 0.9 },
  { value: 'administrative', label: 'Administrative', risk: 1.0 },
  { value: 'manual', label: 'Manual Labor', risk: 1.2 },
  { value: 'hazardous', label: 'Hazardous', risk: 1.8 },
  { value: 'healthcare', label: 'Healthcare', risk: 1.1 },
  { value: 'education', label: 'Education', risk: 0.9 },
  { value: 'technology', label: 'Technology', risk: 0.8 },
  { value: 'finance', label: 'Finance', risk: 0.9 },
  { value: 'unemployed', label: 'Unemployed', risk: 1.3 }
];

const policyTypes = [
  { value: 'life', label: 'Life Insurance', icon: Heart, baseRate: 0.015 },
  { value: 'health', label: 'Health Insurance', icon: Heart, baseRate: 0.02 },
  { value: 'property', label: 'Property Insurance', icon: Home, baseRate: 0.018 },
  { value: 'auto', label: 'Auto Insurance', icon: Car, baseRate: 0.025 },
  { value: 'disability', label: 'Disability Insurance', icon: Briefcase, baseRate: 0.012 }
];

export const RiskCalculator = ({ onPremiumCalculated }) => {
  const [factors, setFactors] = useState({
    ageGroup: '26-40',
    occupation: 'professional',
    isSmoker: false,
    hasChronicIllness: false,
    annualIncome: 60000,
    creditScore: 700,
    hasDangerousHobbies: false,
    locationRisk: 'medium',
    policyType: 'life',
    coverageAmount: 100000
  });

  const [premiumBreakdown, setPremiumBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    calculatePremium();
  }, [factors]);

  const calculatePremium = async () => {
    try {
      setLoading(true);
      const response = await riskService.simulatePremium({
        basePremium: getBasePremium(),
        factors: {
          age: parseInt(factors.ageGroup.split('-')[0]) + 5,
          occupation: factors.occupation,
          isSmoker: factors.isSmoker,
          hasChronicIllness: factors.hasChronicIllness,
          annualIncome: factors.annualIncome,
          creditScore: factors.creditScore,
          hasDangerousHobbies: factors.hasDangerousHobbies,
          locationRisk: factors.locationRisk
        }
      });

      setPremiumBreakdown(response.data);
      onPremiumCalculated?.(response.data);
    } catch (error) {
      console.error('Failed to calculate premium:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBasePremium = () => {
    const policy = policyTypes.find(p => p.value === factors.policyType);
    return factors.coverageAmount * policy.baseRate;
  };

  const handleFactorChange = (key, value) => {
    setFactors(prev => ({ ...prev, [key]: value }));
  };

  const resetCalculator = () => {
    setFactors({
      ageGroup: '26-40',
      occupation: 'professional',
      isSmoker: false,
      hasChronicIllness: false,
      annualIncome: 60000,
      creditScore: 700,
      hasDangerousHobbies: false,
      locationRisk: 'medium',
      policyType: 'life',
      coverageAmount: 100000
    });
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskLevel = (multiplier) => {
    if (multiplier < 0.9) return 'low';
    if (multiplier < 1.3) return 'medium';
    return 'high';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Risk Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Calculate your insurance premium based on personal factors and risk profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input Factors */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Adjust Your Risk Factors
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetCalculator}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>

            <div className="space-y-6">
              {/* Policy Type & Coverage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Policy Type
                  </label>
                  <Select
                    value={factors.policyType}
                    onChange={(value) => handleFactorChange('policyType', value)}
                    options={policyTypes}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coverage Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={factors.coverageAmount}
                      onChange={(e) => handleFactorChange('coverageAmount', parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age Group
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ageGroups.map((group) => (
                      <button
                        key={group.value}
                        type="button"
                        onClick={() => handleFactorChange('ageGroup', group.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          factors.ageGroup === group.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {group.label}
                        <span className="ml-1 text-xs opacity-75">
                          ({group.risk}x)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Occupation
                  </label>
                  <Select
                    value={factors.occupation}
                    onChange={(value) => handleFactorChange('occupation', value)}
                    options={occupationOptions}
                  />
                </div>
              </div>

              {/* Health Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Health Factors
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={factors.isSmoker}
                        onChange={(e) => handleFactorChange('isSmoker', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Smoker</span>
                      <Badge className="ml-auto bg-red-100 text-red-800">+80%</Badge>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={factors.hasChronicIllness}
                        onChange={(e) => handleFactorChange('hasChronicIllness', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Chronic Illness</span>
                      <Badge className="ml-auto bg-red-100 text-red-800">+50%</Badge>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lifestyle
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={factors.hasDangerousHobbies}
                      onChange={(e) => handleFactorChange('hasDangerousHobbies', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Dangerous Hobbies</span>
                    <Badge className="ml-auto bg-yellow-100 text-yellow-800">+40%</Badge>
                  </label>
                </div>
              </div>

              {/* Financial Factors */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Financial Profile
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Annual Income: ${factors.annualIncome.toLocaleString()}
                    </label>
                    <Slider
                      value={factors.annualIncome}
                      onChange={(value) => handleFactorChange('annualIncome', value)}
                      min={20000}
                      max={200000}
                      step={5000}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$20K</span>
                      <span>$200K</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Credit Score: {factors.creditScore}
                    </label>
                    <Slider
                      value={factors.creditScore}
                      onChange={(value) => handleFactorChange('creditScore', value)}
                      min={300}
                      max={850}
                      step={10}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>300</span>
                      <span>850</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Risk */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Location Risk Zone
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'low', label: 'Low', risk: 0.9 },
                    { value: 'medium', label: 'Medium', risk: 1.0 },
                    { value: 'high', label: 'High', risk: 1.3 }
                  ].map((zone) => (
                    <button
                      key={zone.value}
                      type="button"
                      onClick={() => handleFactorChange('locationRisk', zone.value)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        factors.locationRisk === zone.value
                          ? zone.value === 'low' 
                            ? 'bg-green-600 text-white' 
                            : zone.value === 'medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {zone.label}
                      <span className="block text-xs opacity-75 mt-1">
                        {zone.risk}x multiplier
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Premium Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Estimated Premium
              </h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                </div>
              ) : premiumBreakdown ? (
                <>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatCurrency(premiumBreakdown.finalPremium)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {factors.policyType === 'life' ? 'Annual Premium' : 'Monthly Premium'}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Enter details to calculate</div>
              )}
            </div>

            {premiumBreakdown && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Base Premium</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(premiumBreakdown.basePremium)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Risk Multiplier</span>
                  <Badge className={
                    premiumBreakdown.multiplier < 0.9 
                      ? 'bg-green-100 text-green-800'
                      : premiumBreakdown.multiplier < 1.3
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {premiumBreakdown.multiplier.toFixed(2)}x
                  </Badge>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(premiumBreakdown.finalPremium)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="outline"
                  className="w-full"
                >
                  {showDetails ? 'Hide Details' : 'Show Calculation Details'}
                </Button>
              </div>
            )}
          </Card>

          {/* Risk Factors Breakdown */}
          {premiumBreakdown?.appliedFactors && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Applied Risk Factors
              </h3>
              
              <div className="space-y-3">
                {premiumBreakdown.appliedFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {factor.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {factor.factor.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge className={getRiskColor(getRiskLevel(factor.multiplier))}>
                      {factor.multiplier.toFixed(2)}x
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Overall Risk</span>
                  <Badge className={
                    premiumBreakdown.multiplier < 0.9 
                      ? 'bg-green-100 text-green-800'
                      : premiumBreakdown.multiplier < 1.3
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {premiumBreakdown.multiplier < 0.9 ? 'Low' :
                     premiumBreakdown.multiplier < 1.3 ? 'Medium' : 'High'} Risk
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Get Quote
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </div>

      {/* Calculation Details */}
      {showDetails && premiumBreakdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Calculation Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                Hide
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <code className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {premiumBreakdown.calculation}
              </code>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(premiumBreakdown.basePremium)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Base Premium</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {premiumBreakdown.multiplier.toFixed(2)}x
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Risk Multiplier</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(premiumBreakdown.finalPremium - premiumBreakdown.basePremium)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Risk Adjustment</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(premiumBreakdown.finalPremium)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Final Premium</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};export default RiskCalculator;
