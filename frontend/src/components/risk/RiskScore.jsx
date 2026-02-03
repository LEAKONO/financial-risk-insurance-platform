import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, AlertCircle, 
  Shield, Target, Award, 
  BarChart2, Activity, Zap, Thermometer
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { formatPercentage } from '@/utils/formatters';
import { riskService } from '@/services/api';

const riskLevels = {
  low: {
    label: 'Low Risk',
    color: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    description: 'Below average risk profile',
    recommendations: [
      'Maintain healthy lifestyle habits',
      'Consider comprehensive coverage options',
      'Review policy annually for optimal rates'
    ]
  },
  moderate: {
    label: 'Moderate Risk',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    description: 'Average risk profile',
    recommendations: [
      'Improve credit score for better rates',
      'Consider health improvements',
      'Review risk factors regularly'
    ]
  },
  high: {
    label: 'High Risk',
    color: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    description: 'Above average risk profile',
    recommendations: [
      'Focus on risk reduction strategies',
      'Consider higher deductibles',
      'Explore risk management options'
    ]
  },
  'very-high': {
    label: 'Very High Risk',
    color: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    description: 'Significantly above average risk',
    recommendations: [
      'Immediate risk management required',
      'Consider specialized coverage',
      'Consult with risk advisor'
    ]
  }
};

const getRiskLevel = (score) => {
  if (score < 30) return 'low';
  if (score < 60) return 'moderate';
  if (score < 80) return 'high';
  return 'very-high';
};

export const RiskScore = ({ score = 50, previousScore, category = 'overall', showDetails = true }) => {
  const [comparison, setComparison] = useState(null);
  const [trend, setTrend] = useState(null);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComparisonData();
    analyzeTrend();
    loadFactorBreakdown();
  }, [score, previousScore]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      const response = await riskService.compareWithAverage();
      setComparison(response.data);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTrend = () => {
    if (previousScore) {
      const diff = score - previousScore;
      setTrend({
        direction: diff > 0 ? 'up' : 'down',
        amount: Math.abs(diff),
        percentage: Math.abs((diff / previousScore) * 100)
      });
    }
  };

  const loadFactorBreakdown = async () => {
    try {
      const response = await riskService.getRiskAnalysis();
      if (response.data.factors) {
        setFactors(Object.values(response.data.factors).flat());
      }
    } catch (error) {
      console.error('Failed to load factor breakdown:', error);
    }
  };

  const riskLevel = getRiskLevel(score);
  const riskConfig = riskLevels[riskLevel];

  const getScoreColor = (s) => {
    if (s < 30) return 'text-green-600 dark:text-green-400';
    if (s < 60) return 'text-yellow-600 dark:text-yellow-400';
    if (s < 80) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (s) => {
    if (s < 30) return 'bg-green-500';
    if (s < 60) return 'bg-yellow-500';
    if (s < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Main Score Display */}
      <Card className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Score Circle */}
          <div className="relative">
            <div className="relative w-48 h-48">
              {/* Background Circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  className="dark:stroke-gray-700"
                />
                {/* Progress arc */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getScoreBackground(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: score / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  transform="rotate(-90 50 50)"
                  strokeDasharray="283"
                  strokeDashoffset={283 * (1 - score / 100)}
                />
              </svg>
              
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className={`text-5xl font-bold ${getScoreColor(score)}`}
                >
                  {score}
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  out of 100
                </div>
              </div>
            </div>
            
            {/* Risk Level Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
            >
              <Badge className={`px-4 py-2 ${riskConfig.bgColor} ${riskConfig.textColor} text-sm font-semibold`}>
                {riskConfig.label}
              </Badge>
            </motion.div>
          </div>

          {/* Score Details */}
          <div className="flex-1 max-w-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Risk Assessment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {category === 'overall' ? 'Overall Risk Score' : `${category.charAt(0).toUpperCase() + category.slice(1)} Risk Score`}
              </p>
            </div>

            {/* Trend Indicator */}
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                  trend.direction === 'up' 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                }`}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {trend.direction === 'up' ? 'Increased' : 'Decreased'} by {trend.amount} points
                </span>
                <span className="text-sm opacity-75">
                  ({trend.percentage.toFixed(1)}%)
                </span>
              </motion.div>
            )}

            {/* Comparison */}
            {comparison && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Compared to Average</span>
                  <span className={`font-semibold ${
                    comparison.comparison.scoreDifference < 0 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {comparison.comparison.scoreDifference > 0 ? '+' : ''}
                    {comparison.comparison.scoreDifference} points
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Percentile Rank</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {comparison.comparison.percentile.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Premium Impact</span>
                  <span className={`font-semibold ${
                    comparison.comparison.premiumImpact.includes('-')
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {comparison.comparison.premiumImpact}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Risk Breakdown */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Health Risk', 
              score: 65, 
              icon: Activity,
              description: 'Based on health factors and lifestyle',
              factors: ['BMI', 'Smoking', 'Chronic Conditions']
            },
            { 
              label: 'Financial Risk', 
              score: 45, 
              icon: BarChart2,
              description: 'Based on financial stability',
              factors: ['Credit Score', 'Income', 'Debt Ratio']
            },
            { 
              label: 'Occupation Risk', 
              score: 70, 
              icon: Briefcase,
              description: 'Based on job type and environment',
              factors: ['Job Type', 'Work Environment', 'Travel']
            },
            { 
              label: 'Geographic Risk', 
              score: 55, 
              icon: MapPin,
              description: 'Based on location and environment',
              factors: ['Crime Rate', 'Disaster Risk', 'Infrastructure']
            }
          ].map((category, index) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-2 rounded-lg ${
                        getScoreBackground(category.score)
                      }`}>
                        <category.icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.label}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                    {category.score}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-full ${getScoreBackground(category.score)}`}
                  />
                </div>

                {/* Factors */}
                <div className="space-y-2">
                  {category.factors.map((factor, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{factor}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round(30 + Math.random() * 40)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Management Recommendations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on your risk profile assessment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskConfig.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className={`p-2 rounded-lg ${riskConfig.bgColor}`}>
                <Zap className="w-4 h-4 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Recommendation {index + 1}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {rec}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Improve Score
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Get Coverage
          </Button>
          <Button className="ml-auto">
            <Award className="w-4 h-4 mr-2" />
            View Detailed Report
          </Button>
        </div>
      </Card>

      {/* Factor Impact Analysis */}
      {factors.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Factor Impact Analysis
          </h3>
          
          <div className="space-y-4">
            {factors.slice(0, 5).map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    factor.level === 'low' ? 'bg-green-500' :
                    factor.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {factor.description}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {factor.category} • {factor.factor}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    factor.multiplier > 1 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {factor.multiplier.toFixed(2)}x
                  </div>
                  <div className="text-xs text-gray-500">
                    {factor.level} impact
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {factors.length > 5 && (
            <div className="text-center mt-4">
              <Button variant="ghost" size="sm">
                View All {factors.length} Factors
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Historical Trends */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Score Trend
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Historical risk score progression
            </p>
          </div>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>All time</option>
          </select>
        </div>

        {/* Placeholder for chart */}
        <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Risk trend visualization</p>
            <p className="text-sm text-gray-400">Chart would show historical scores here</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};export default RiskScore;
