import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import RiskCalculator from '@/components/risk/RiskCalculator';
import RiskScore from '@/components/risk/RiskScore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LineChart } from "@/components/charts/LineChart";
import { riskService } from '@/services/api';

const RiskAssessment = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  // API STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskData, setRiskData] = useState({
    riskScore: 65,
    riskFactors: [],
    analysis: null,
    comparison: null
  });

  // FETCH RISK DATA
  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch risk profile and analysis
      const [profileRes, analysisRes, comparisonRes] = await Promise.all([
        riskService.getProfile(),
        riskService.getAnalysis(),
        riskService.compareWithAverage()
      ]);
      
      if (profileRes.success) {
        setRiskData({
          riskScore: profileRes.data.riskScore || 65,
          riskFactors: transformRiskFactors(profileRes.data),
          analysis: analysisRes.success ? analysisRes.data : null,
          comparison: comparisonRes.success ? comparisonRes.data : null
        });
      } else {
        // If no risk profile, show empty state
        setRiskData({
          riskScore: 0,
          riskFactors: [],
          analysis: null,
          comparison: null
        });
      }
    } catch (err) {
      console.error('Risk data fetch error:', err);
      // Use default data if API fails
      setRiskData({
        riskScore: 65,
        riskFactors: getDefaultRiskFactors(),
        analysis: null,
        comparison: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform API risk profile into risk factors
  const transformRiskFactors = (profile) => {
    if (!profile) return getDefaultRiskFactors();

    return [
      {
        category: 'Personal',
        factors: [
          { 
            name: 'Age', 
            value: profile.age?.toString() || 'N/A', 
            impact: getImpactLevel(profile.age, [18, 40, 55, 65]),
            description: 'Current age'
          },
          { 
            name: 'Occupation', 
            value: profile.occupation || 'N/A', 
            impact: 'Medium',
            description: profile.occupationType || 'Occupation type'
          },
          { 
            name: 'BMI', 
            value: profile.bmi?.toFixed(1) || 'N/A', 
            impact: getImpactLevel(profile.bmi, [18.5, 25, 30]),
            description: 'Body mass index'
          }
        ]
      },
      {
        category: 'Health',
        factors: [
          { 
            name: 'Smoking', 
            value: profile.smoker ? 'Yes' : 'No', 
            impact: profile.smoker ? 'High' : 'Low',
            description: 'Smoking status'
          },
          { 
            name: 'Chronic Illness', 
            value: profile.hasChronicIllness ? 'Yes' : 'None', 
            impact: profile.hasChronicIllness ? 'High' : 'Low',
            description: 'Chronic conditions'
          },
          { 
            name: 'Family History', 
            value: profile.familyHistory || 'Low Risk', 
            impact: 'Medium',
            description: 'Genetic factors'
          }
        ]
      },
      {
        category: 'Lifestyle',
        factors: [
          { 
            name: 'Exercise', 
            value: profile.exerciseFrequency || 'Regular', 
            impact: 'Low',
            description: 'Physical activity'
          },
          { 
            name: 'Hobbies', 
            value: profile.hasHazardousHobbies ? 'High Risk' : 'Low Risk', 
            impact: profile.hasHazardousHobbies ? 'High' : 'Low',
            description: 'Recreational activities'
          },
          { 
            name: 'Travel', 
            value: profile.travelFrequency || 'Occasional', 
            impact: 'Medium',
            description: 'Travel frequency'
          }
        ]
      },
      {
        category: 'Financial',
        factors: [
          { 
            name: 'Income', 
            value: profile.annualIncome ? `$${profile.annualIncome}` : 'N/A', 
            impact: 'Low',
            description: 'Annual income'
          },
          { 
            name: 'Credit Score', 
            value: profile.creditScore?.toString() || 'N/A', 
            impact: getImpactLevel(profile.creditScore, [580, 670, 740]),
            description: 'Credit history'
          },
          { 
            name: 'Debt Ratio', 
            value: profile.debtRatio ? `${profile.debtRatio}%` : 'N/A', 
            impact: 'Medium',
            description: 'Debt to income'
          }
        ]
      }
    ];
  };

  // Helper to get impact level based on value ranges
  const getImpactLevel = (value, thresholds) => {
    if (!value) return 'Medium';
    if (value < thresholds[0]) return 'High';
    if (value < thresholds[1]) return 'Low';
    if (value < thresholds[2]) return 'Medium';
    return 'High';
  };

  // Default risk factors if no profile exists
  const getDefaultRiskFactors = () => {
    return [
      {
        category: 'Personal',
        factors: [
          { name: 'Age', value: 'Not set', impact: 'Medium', description: 'Complete your profile' },
          { name: 'Occupation', value: 'Not set', impact: 'Medium', description: 'Complete your profile' },
          { name: 'BMI', value: 'Not set', impact: 'Medium', description: 'Complete your profile' }
        ]
      },
      {
        category: 'Health',
        factors: [
          { name: 'Smoking', value: 'Not set', impact: 'Medium', description: 'Complete your profile' },
          { name: 'Chronic Illness', value: 'Not set', impact: 'Medium', description: 'Complete your profile' },
          { name: 'Family History', value: 'Not set', impact: 'Medium', description: 'Complete your profile' }
        ]
      }
    ];
  };

  const riskHistoryData = [
    { date: 'Jan', value: 72 },
    { date: 'Feb', value: 70 },
    { date: 'Mar', value: 68 },
    { date: 'Apr', value: 67 },
    { date: 'May', value: 66 },
    { date: 'Jun', value: riskData.riskScore },
  ];

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

  const handleCalculateRisk = async (data) => {
    try {
      const response = await riskService.createOrUpdateRiskProfile(data);
      if (response.success) {
        await fetchRiskData(); // Refresh data
        setIsCalculatorOpen(false);
      }
    } catch (error) {
      console.error('Error calculating risk:', error);
    }
  };

  const getRiskCategory = (score) => {
    if (score <= 30) return { label: 'Very Low', color: 'from-emerald-500 to-green-500' };
    if (score <= 50) return { label: 'Low', color: 'from-blue-500 to-cyan-500' };
    if (score <= 70) return { label: 'Medium', color: 'from-yellow-500 to-orange-500' };
    if (score <= 85) return { label: 'High', color: 'from-orange-500 to-red-500' };
    return { label: 'Very High', color: 'from-red-500 to-rose-500' };
  };

  const riskCategory = getRiskCategory(riskData.riskScore);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading risk assessment...</p>
        </div>
      </div>
    );
  }

  // No profile state
  if (riskData.riskScore === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Risk Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            To view your personalized risk assessment, please complete your risk profile first.
          </p>
          <Button
            onClick={() => setIsCalculatorOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <CalculatorIcon className="w-5 h-5 mr-2" />
            Complete Risk Profile
          </Button>
        </div>
      </div>
    );
  }

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
            <span>Update Risk Profile</span>
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
              Your Risk Score: {riskData.riskScore}/100
            </h2>
            
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
              <div className={`px-4 py-2 bg-gradient-to-r ${riskCategory.color} rounded-full font-semibold`}>
                {riskCategory.label} Risk
              </div>
              <div className="text-blue-100">
                {riskData.riskScore <= 50 ? 'Excellent' : riskData.riskScore <= 70 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            
            <p className="text-blue-100 max-w-2xl">
              Based on your profile analysis, you're in a {riskCategory.label.toLowerCase()} risk category. 
              This score impacts your insurance premiums and coverage options.
            </p>
          </div>
          
          <div className="relative">
            <RiskScore score={riskData.riskScore} size={200} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl font-bold">{riskData.riskScore}</div>
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
              {riskData.riskFactors.reduce((sum, cat) => sum + cat.factors.length, 0)} factors analyzed
            </div>
          </div>
          
          <div className="space-y-6">
            {riskData.riskFactors.map((category, categoryIndex) => (
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
              {riskData.riskScore < 65 ? (
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
            <LineChart 
              data={riskHistoryData}
              width={300}
              height={250}
              xField="date"
              yField="value"
              title=""
              showLegend={false}
              showGrid={true}
              timeFormat="%b"
              yAxisFormat={d => `${d}`}
            />
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Starting Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">72</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">{riskData.riskScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Change</span>
              <span className={`font-semibold ${riskData.riskScore < 72 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {riskData.riskScore < 72 ? '-' : '+'}{Math.abs(riskData.riskScore - 72)} points
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
              <span className="font-bold">{riskData.riskScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Industry Average</span>
              <span className="font-bold">{riskData.comparison?.average || 58}</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${(riskData.riskScore / 100) * 100}%` }}
              />
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-200 rounded-full"
                style={{ width: `${(riskData.comparison?.average || 58)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span>Premium Impact</span>
              <span className={`font-bold ${riskData.riskScore <= 58 ? 'text-emerald-200' : 'text-yellow-200'}`}>
                {riskData.riskScore <= 58 ? '-12%' : '+8%'}
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