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
        riskScore: 0, // Changed to 0 to trigger empty state
        riskFactors: [],
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

  const handleCalculateRisk = async (data) => {
    console.log('Calculate risk called with data:', data);
    try {
      const response = await riskService.createOrUpdateRiskProfile(data);
      console.log('Risk profile response:', response);
      if (response.success) {
        await fetchRiskData(); // Refresh data
        setIsCalculatorOpen(false);
      }
    } catch (error) {
      console.error('Error calculating risk:', error);
    }
  };

  const handleOpenCalculator = () => {
    console.log('Open calculator clicked!');
    setIsCalculatorOpen(true);
  };

  const handleCloseCalculator = () => {
    console.log('Close calculator clicked!');
    setIsCalculatorOpen(false);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your risk assessment...</p>
        </div>
      </div>
    );
  }

  // No profile state - Beautiful empty state
  if (riskData.riskScore === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <ShieldCheckIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Risk Assessment Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get personalized insights into your insurance risk profile and discover ways to optimize your premiums
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Complete Your Risk Profile
                </h2>
                <p className="text-blue-100">
                  Start your personalized risk assessment journey
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8">
                {/* Icon Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { icon: ChartBarIcon, label: 'Risk Analysis', color: 'blue' },
                    { icon: ShieldCheckIcon, label: 'Premium Insights', color: 'green' },
                    { icon: ExclamationTriangleIcon, label: 'Factor Breakdown', color: 'yellow' },
                    { icon: ArrowTrendingUpIcon, label: 'Improvement Tips', color: 'purple' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900/20 rounded-xl mb-3`}>
                        <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Benefits List */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    What You'll Get:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Comprehensive risk score analysis',
                      'Personalized premium estimates',
                      'Actionable improvement recommendations',
                      'Real-time comparison with peers',
                      'Detailed factor breakdowns',
                      'Savings opportunities'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <button
                    onClick={handleOpenCalculator}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <CalculatorIcon className="w-6 h-6 mr-3" />
                    Get Started - Complete Risk Profile
                    <ArrowRightIcon className="w-5 h-5 ml-3" />
                  </button>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Takes only 5-10 minutes to complete
                  </p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  icon: BoltIcon,
                  title: 'Quick & Easy',
                  description: 'Complete your profile in under 10 minutes'
                },
                {
                  icon: ShieldCheckIcon,
                  title: 'Secure & Private',
                  description: 'Your data is encrypted and protected'
                },
                {
                  icon: ChartBarIcon,
                  title: 'Instant Results',
                  description: 'Get your risk score immediately'
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-4">
                    <card.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Modal */}
        {isCalculatorOpen && (
          <Modal
            isOpen={isCalculatorOpen}
            onClose={handleCloseCalculator}
            title="Calculate Your Risk Score"
            size="xl"
          >
            <RiskCalculator onPremiumCalculated={handleCalculateRisk} />
          </Modal>
        )}
      </div>
    );
  }

  // Main content when profile exists (placeholder for now)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
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
            <button
              onClick={handleOpenCalculator}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
            >
              <CalculatorIcon className="w-5 h-5 mr-2" />
              <span>Update Risk Profile</span>
            </button>
          </div>
        </div>

        {/* Your full dashboard content will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Risk score: {riskData.riskScore}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Full dashboard coming soon...
          </p>
        </div>
      </div>

      {/* Modal */}
      {isCalculatorOpen && (
        <Modal
          isOpen={isCalculatorOpen}
          onClose={handleCloseCalculator}
          title="Calculate Your Risk Score"
          size="xl"
        >
          <RiskCalculator onPremiumCalculated={handleCalculateRisk} />
        </Modal>
      )}
    </div>
  );
};

export default RiskAssessment;