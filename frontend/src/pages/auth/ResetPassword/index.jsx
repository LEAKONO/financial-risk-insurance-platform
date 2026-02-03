import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BoltIcon,
  UserIcon,
  BuildingOfficeIcon,
  HeartIcon,
  CreditCardIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import RiskCalculator from '@/components/risk/RiskCalculator';
import RiskScore from '@/components/risk/RiskScore';
import RiskFactors from '@/components/risk/RiskFactors';
import RiskSummary from '@/components/risk/RiskSummary';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LineChart } from "@/components/charts/LineChart";

const RiskAssessment = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [riskScore, setRiskScore] = useState(65);
  const [riskProfile, setRiskProfile] = useState(null);

  const riskFactors = [
    {
      category: 'Personal',
      factors: [
        { name: 'Age', value: '35', impact: 'Medium', description: 'Prime age for insurance' },
        { name: 'Occupation', value: 'Software Engineer', impact: 'Low', description: 'Low-risk profession' },
        { name: 'BMI', value: '24.5', impact: 'Low', description: 'Healthy weight range' }
      ]
    },
    {
      category: 'Health',
      factors: [
        { name: 'Smoking', value: 'No', impact: 'Low', description: 'Non-smoker' },
        { name: 'Chronic Illness', value: 'None', impact: 'Low', description: 'No known conditions' },
        { name: 'Family History', value: 'Low Risk', impact: 'Medium', description: 'Minor genetic factors' }
      ]
    },
    {
      category: 'Lifestyle',
      factors: [
        { name: 'Exercise', value: 'Regular', impact: 'Low', description: 'Active lifestyle' },
        { name: 'Hobbies', value: 'Low Risk', impact: 'Low', description: 'Safe recreational activities' },
        { name: 'Travel', value: 'Occasional', impact: 'Medium', description: 'International travel 2x/year' }
      ]
    },
    {
      category: 'Financial',
      factors: [
        { name: 'Income', value: '$120,000', impact: 'Low', description: 'Stable high income' },
        { name: 'Credit Score', value: '780', impact: 'Low', description: 'Excellent credit history' },
        { name: 'Debt Ratio', value: '25%', impact: 'Medium', description: 'Manageable debt level' }
      ]
    }
  ];

  const riskHistory = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Risk Score',
        data: [72, 70, 68, 67, 66, 65, 64, 65, 65, 65, 65, 65],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const recommendations = [
    {
      title: 'Improve Credit Score',
      description: 'Maintain payment history to reduce financial risk',
      impact: 'Could reduce premium by 5-10%',
      priority: 'Medium'
    },
    {
      title: 'Regular Health Checkups',
      description: 'Annual medical exams to monitor health indicators',
      impact: 'Could improve risk assessment by 8%',
      priority: 'High'
    },
    {
      title: 'Increase Physical Activity',
      description: 'Add 30 minutes of exercise 5 days a week',
      impact: 'Could lower BMI-related risk factors',
      priority: 'Low'
    },
    {
      title: 'Debt Reduction Plan',
      description: 'Reduce debt-to-income ratio below 20%',
      impact: 'Could improve financial stability score',
      priority: 'Medium'
    }
  ];

  const handleCalculateRisk = (data) => {
    // In a real app, this would call an API
    const calculatedScore = Math.floor(Math.random() * 30) + 50; // Random score 50-80
    setRiskScore(calculatedScore);
    setRiskProfile(data);
    setIsCalculatorOpen(false);
  };

  const getRiskCategory = (score) => {
    if (score <= 30) return { label: 'Very Low', color: 'from-emerald-500 to-green-500' };
    if (score <= 50) return { label: 'Low', color: 'from-blue-500 to-cyan-500' };
    if (score <= 70) return { label: 'Medium', color: 'from-yellow-500 to-orange-500' };
    if (score <= 85) return { label: 'High', color: 'from-orange-500 to-red-500' };
    return { label: 'Very High', color: 'from-red-500 to-rose-500' };
  };

  const riskCategory = getRiskCategory(riskScore);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Risk Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze and optimize your insurance risk profile
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <BoltIcon className="w-5 h-5" />
            <span>Save Report</span>
          </Button>
          <Button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <CalculatorIcon className="w-5 h-5" />
            <span>Calculate Risk</span>
          </Button>
        </div>
      </div>

      {/* Risk Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              <span>Current Risk Profile</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Risk Score: {riskScore}/100
            </h2>
            
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
              <div className={`px-4 py-2 bg-gradient-to-r ${riskCategory.color} rounded-full font-semibold`}>
                {riskCategory.label} Risk
              </div>
              <div className="text-blue-100">
                {riskScore <= 50 ? 'Excellent' : riskScore <= 70 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            
            <p className="text-blue-100 max-w-2xl">
              Based on your profile analysis, you're in a {riskCategory.label.toLowerCase()} risk category. 
              This score impacts your insurance premiums and coverage options.
            </p>
          </div>
          
          <div className="relative">
            <RiskScore score={riskScore} size={200} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{riskScore}</div>
                <div className="text-sm text-blue-100">/100</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Factors Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Risk Factors Breakdown
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              12 factors analyzed
            </div>
          </div>
          
          <div className="space-y-6">
            {riskFactors.map((category, categoryIndex) => (
              <div key={category.category}>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {category.category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.factors.map((factor, factorIndex) => (
                    <motion.div
                      key={factor.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (categoryIndex * 0.3) + (factorIndex * 0.1) }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {factor.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          factor.impact === 'Low' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : factor.impact === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {factor.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {factor.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Risk Trend
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              {riskScore < 65 ? (
                <>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Improving</span>
                </>
              ) : (
                <>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Increasing</span>
                </>
              )}
            </div>
          </div>
          
          <div className="h-64">
            <LineChart data={riskHistory} />
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Starting Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">72</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">{riskScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Change</span>
              <span className={`font-semibold ${riskScore < 72 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {riskScore < 72 ? '-' : '+'}{Math.abs(riskScore - 72)} points
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Personalized Recommendations
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Based on your risk profile
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${
                  rec.priority === 'High' 
                    ? 'bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30' 
                    : rec.priority === 'Medium'
                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
                } flex items-center justify-center`}>
                  {rec.priority === 'High' && <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
                  {rec.priority === 'Medium' && <ChartBarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
                  {rec.priority === 'Low' && <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  rec.priority === 'High' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : rec.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {rec.title}
              </h4>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {rec.description}
              </p>
              
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {rec.impact}
              </div>
              
              <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center">
                Learn more
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Comparison & Premium Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison with Average */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Comparison with Average</h3>
              <p className="text-emerald-100">How you compare to other users</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Your Risk Score</span>
              <span className="font-bold">{riskScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Industry Average</span>
              <span className="font-bold">58</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${(riskScore / 100) * 100}%` }}
              />
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-200 rounded-full"
                style={{ width: '58%' }}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span>Premium Impact</span>
              <span className={`font-bold ${riskScore <= 58 ? 'text-emerald-200' : 'text-yellow-200'}`}>
                {riskScore <= 58 ? '-12%' : '+8%'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Premium Impact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CalculatorIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Premium Impact</h3>
              <p className="text-blue-100">Estimated effect on your insurance costs</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>Current Premium</span>
                <span className="font-bold">$450/month</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>With Risk Optimization</span>
                <span className="font-bold text-emerald-200">$396/month</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-200 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">$648</div>
                <div className="text-blue-100">Annual Savings Potential</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Optimize Your Risk Profile?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Implement our recommendations and track your progress over time to 
            improve your risk score and reduce insurance premiums.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">
                Go to Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => setIsCalculatorOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Recalculate Risk
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Risk Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Calculate Your Risk Score"
        size="xl"
      >
        <RiskCalculator onPremiumCalculated={handleCalculateRisk} />
      </Modal>
    </div>
  );
};

export default RiskAssessment;