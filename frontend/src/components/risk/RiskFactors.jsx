import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Info,
  Shield, Heart, Brain, DollarSign,
  MapPin, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { formatPercentage } from '@/utils/formatters';

const riskCategories = {
  health: {
    title: 'Health Factors',
    icon: Heart,
    color: 'bg-red-500',
    factors: [
      {
        id: 'age',
        name: 'Age',
        description: 'Younger age typically means lower health risk',
        impact: 'Medium',
        direction: 'lower',
        details: 'Age significantly affects health insurance premiums'
      },
      {
        id: 'smoking',
        name: 'Smoking',
        description: 'Smokers face significantly higher health risks',
        impact: 'High',
        direction: 'higher',
        details: 'Can increase premiums by 50-100%'
      },
      {
        id: 'bmi',
        name: 'BMI',
        description: 'Body Mass Index affects overall health risk',
        impact: 'Medium',
        direction: 'higher',
        details: 'Optimal BMI range is 18.5-24.9'
      },
      {
        id: 'chronic_conditions',
        name: 'Chronic Conditions',
        description: 'Pre-existing health conditions increase risk',
        impact: 'High',
        direction: 'higher',
        details: 'Conditions like diabetes, heart disease significantly impact rates'
      }
    ]
  },
  occupation: {
    title: 'Occupation & Lifestyle',
    icon: Activity,
    color: 'bg-blue-500',
    factors: [
      {
        id: 'occupation_type',
        name: 'Occupation Type',
        description: 'Risk level varies by profession',
        impact: 'High',
        direction: 'higher',
        details: 'Hazardous jobs can double insurance costs'
      },
      {
        id: 'hobbies',
        name: 'Dangerous Hobbies',
        description: 'Extreme sports and risky activities',
        impact: 'Medium',
        direction: 'higher',
        details: 'Activities like skydiving, racing increase premiums'
      },
      {
        id: 'travel',
        name: 'Travel Frequency',
        description: 'Frequent travel increases exposure',
        impact: 'Low',
        direction: 'higher',
        details: 'International travel to high-risk areas affects rates'
      }
    ]
  },
  financial: {
    title: 'Financial Stability',
    icon: DollarSign,
    color: 'bg-green-500',
    factors: [
      {
        id: 'income',
        name: 'Income Level',
        description: 'Higher income often correlates with lower risk',
        impact: 'Medium',
        direction: 'lower',
        details: 'Stable income reduces default risk'
      },
      {
        id: 'credit_score',
        name: 'Credit Score',
        description: 'Credit history indicates financial responsibility',
        impact: 'High',
        direction: 'lower',
        details: 'Excellent credit (740+) can reduce premiums by 10-20%'
      },
      {
        id: 'debt',
        name: 'Debt-to-Income Ratio',
        description: 'Financial obligations impact risk assessment',
        impact: 'Medium',
        direction: 'higher',
        details: 'Lower ratios preferred for better rates'
      }
    ]
  },
  geographic: {
    title: 'Geographic Factors',
    icon: MapPin,
    color: 'bg-purple-500',
    factors: [
      {
        id: 'location',
        name: 'Location Risk Zone',
        description: 'Area-specific risks affect premiums',
        impact: 'Medium',
        direction: 'higher',
        details: 'High-crime or disaster-prone areas increase costs'
      },
      {
        id: 'property_value',
        name: 'Property Value',
        description: 'Home value and construction quality',
        impact: 'High',
        direction: 'higher',
        details: 'Higher value properties cost more to insure'
      },
      {
        id: 'crime_rate',
        name: 'Local Crime Rate',
        description: 'Area crime statistics',
        impact: 'Medium',
        direction: 'higher',
        details: 'Affects property and auto insurance rates'
      }
    ]
  }
};

export const RiskFactors = ({ onFactorSelect, selectedFactors = [] }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFactor, setExpandedFactor] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'positive', 'negative'

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleFactor = (factorId) => {
    setExpandedFactor(expandedFactor === factorId ? null : factorId);
  };

  const handleFactorClick = (factor) => {
    onFactorSelect?.(factor);
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getDirectionIcon = (direction) => {
    if (direction === 'higher') {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    }
  };

  const filteredCategories = Object.entries(riskCategories).map(([id, category]) => {
    const filteredFactors = category.factors.filter(factor => {
      if (viewMode === 'all') return true;
      if (viewMode === 'positive') return factor.direction === 'lower';
      if (viewMode === 'negative') return factor.direction === 'higher';
      return true;
    });

    return { id, ...category, factors: filteredFactors };
  }).filter(category => category.factors.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Risk Factors Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Understand how different factors affect your insurance premiums and risk assessment
        </p>
      </div>

      {/* View Mode Selector */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Risk Factors
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View factors by their impact on your premiums
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('all')}
            >
              All Factors
            </Button>
            <Button
              variant={viewMode === 'positive' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('positive')}
              className="flex items-center gap-1"
            >
              <TrendingDown className="w-4 h-4" />
              Reduces Premium
            </Button>
            <Button
              variant={viewMode === 'negative' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('negative')}
              className="flex items-center gap-1"
            >
              <TrendingUp className="w-4 h-4" />
              Increases Premium
            </Button>
          </div>
        </div>
      </Card>

      {/* Risk Categories */}
      <div className="space-y-6">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${category.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.factors.length} risk factors
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {category.factors.filter(f => f.direction === 'higher').length} increase
                    </Badge>
                    <div className={`transform transition-transform ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.factors.map((factor) => {
                          const isSelected = selectedFactors.some(f => f.id === factor.id);
                          
                          return (
                            <motion.div
                              key={factor.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                                className={`p-4 cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                                onClick={() => handleFactorClick(factor)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      {factor.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {factor.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getDirectionIcon(factor.direction)}
                                    <Badge className={getImpactColor(factor.impact)}>
                                      {factor.impact}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFactor(factor.id);
                                    }}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                  >
                                    {expandedFactor === factor.id ? 'Hide Details' : 'Learn More'}
                                  </button>
                                  
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  )}
                                </div>

                                {/* Factor Details */}
                                {expandedFactor === factor.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                                  >
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Info className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          Impact Details
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {factor.details}
                                      </p>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                      <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                        <div className="text-xs text-gray-500">Premium Impact</div>
                                        <div className={`font-semibold ${
                                          factor.direction === 'higher' 
                                            ? 'text-red-600' 
                                            : 'text-green-600'
                                        }`}>
                                          {factor.direction === 'higher' ? 'Increases' : 'Reduces'} 10-30%
                                        </div>
                                      </div>
                                      <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                        <div className="text-xs text-gray-500">Control Level</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                          {factor.id === 'age' ? 'Fixed' : 'Adjustable'}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Factors Summary */}
      {selectedFactors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-6 z-10"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-blue-800 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Selected Risk Factors
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFactors.length} factors affecting your premium
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {selectedFactors.map((factor) => (
                    <Badge
                      key={factor.id}
                      className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                    >
                      {factor.name}
                      <button
                        onClick={() => onFactorSelect?.(factor)}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => onFactorSelect?.(null)} // Clear all
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Risk Management Tips */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Risk Management Tips
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Maintain a healthy lifestyle to improve health risk factors</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Improve your credit score for better financial risk assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Implement safety measures to reduce property and auto risks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Regularly review and update your risk profile for accurate premiums</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};