import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../../../components/ui/Card/StatsCard';
import PolicyCard from '../../../components/policy/PolicyCard';
import ClaimCard from '../../../components/claims/ClaimCard';
import LineChart from '../../../components/charts/LineChart';
import PieChart from '../../../components/charts/PieChart';
import { policyService, claimService, userService } from '../../../services/api';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  // API STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    policies: [],
    claims: [],
    stats: {
      activePolicies: 0,
      totalCoverage: 0,
      pendingClaims: 0,
      riskScore: 65
    }
  });

  // FETCH DASHBOARD DATA
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [policiesResult, claimsResult, userResult] = await Promise.allSettled([
        policyService.getUserPolicies({ limit: 3 }),
        claimService.getClaims({ limit: 3 }),
        userService.getDashboard()
      ]);

      // Process policies
      let policies = [];
      if (policiesResult.status === 'fulfilled' && policiesResult.value.success) {
        const responseData = policiesResult.value.data;
        
        // Check if policies array exists in response
        if (responseData && responseData.policies && Array.isArray(responseData.policies)) {
          policies = responseData.policies.slice(0, 3).map(policy => ({
            id: policy._id,
            name: policy.name,
            policyNumber: policy.policyNumber,
            premium: policy.totalPremium ? `$${policy.totalPremium}/month` : '$0/month',
            status: policy.status,
            nextPayment: policy.premiumSchedule && policy.premiumSchedule[0] && policy.premiumSchedule[0].dueDate 
              ? new Date(policy.premiumSchedule[0].dueDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            coverage: policy.coverage && policy.coverage[0] && policy.coverage[0].coverageAmount 
              ? `$${policy.coverage[0].coverageAmount}` 
              : '$0',
            type: (policy.coverage && policy.coverage[0] && policy.coverage[0].type) || policy.type || 'general',
            totalPremium: policy.totalPremium || 0,
            totalCoverage: (policy.coverage && policy.coverage[0] && policy.coverage[0].coverageAmount) || 0,
            endDate: policy.endDate 
              ? new Date(policy.endDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            riskScore: policy.riskMultiplier ? Math.round(policy.riskMultiplier * 100) : 65
          }));
        }
      }

      // Process claims
      let claims = [];
      if (claimsResult.status === 'fulfilled' && claimsResult.value.success) {
        const responseData = claimsResult.value.data;
        
        // Check if claims array exists in response
        if (responseData && responseData.claims && Array.isArray(responseData.claims)) {
          claims = responseData.claims.slice(0, 3).map(claim => ({
            id: claim._id,
            claimNumber: claim.claimNumber,
            policyName: claim.policy ? claim.policy.name : 'Unknown Policy',
            amount: claim.claimAmount ? `$${claim.claimAmount}` : '$0',
            status: claim.status,
            date: claim.incidentDate 
              ? new Date(claim.incidentDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            type: claim.claimType || 'general'
          }));
        }
      }

      // Calculate stats
      let stats = {
        activePolicies: 0,
        totalCoverage: 0,
        pendingClaims: 0,
        riskScore: 65
      };

      // Calculate from actual policies data
      if (policiesResult.status === 'fulfilled' && policiesResult.value.success) {
        const responseData = policiesResult.value.data;
        if (responseData && responseData.policies) {
          const allPolicies = responseData.policies;
          stats.activePolicies = allPolicies.filter(p => p.status === 'active').length;
          stats.totalCoverage = allPolicies.reduce((sum, p) => {
            const coverageAmount = p.coverage && p.coverage[0] && p.coverage[0].coverageAmount;
            return sum + (coverageAmount || 0);
          }, 0);
        }
      }

      // Calculate from actual claims data
      if (claimsResult.status === 'fulfilled' && claimsResult.value.success) {
        const responseData = claimsResult.value.data;
        if (responseData && responseData.claims) {
          const allClaims = responseData.claims;
          stats.pendingClaims = allClaims.filter(c => 
            c.status === 'pending' || c.status === 'processing'
          ).length;
        }
      }

      // Get risk score from user data
      if (userResult.status === 'fulfilled' && userResult.value.success) {
        stats.riskScore = userResult.value.data?.stats?.riskScore || 65;
      }

      setDashboardData({
        policies,
        claims,
        stats
      });

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Chart data (this is static for now, can be replaced with real data)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Premium Payments',
        data: [3200, 3500, 3800, 4200, 3900, 4500],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      },
      {
        label: 'Claim Amounts',
        data: [1500, 1800, 2200, 1900, 2500, 2100],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true
      }
    ]
  };

  const riskData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ]
      }
    ]
  };

  const stats = [
    {
      title: 'Active Policies',
      value: dashboardData.stats.activePolicies.toString(),
      change: '+0',
      isPositive: true,
      icon: ShieldCheckIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Coverage',
      value: dashboardData.stats.totalCoverage > 0 
        ? `$${(dashboardData.stats.totalCoverage / 1000000).toFixed(1)}M`
        : '$0',
      change: '+0%',
      isPositive: true,
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 to-green-500'
    },
    {
      title: 'Pending Claims',
      value: dashboardData.stats.pendingClaims.toString(),
      change: '+0',
      isPositive: false,
      icon: ExclamationTriangleIcon,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Risk Score',
      value: dashboardData.stats.riskScore.toFixed(0),
      change: '-0',
      isPositive: true,
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-6">
          <div className="text-red-600 text-xl mb-4">⚠️ Connection Error</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your insurance portfolio today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/dashboard/policies">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/30 transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                <span>New Policy</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium & Claims Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Premium & Claims Trend
            </h2>
            <select className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <div className="h-80">
            <LineChart data={chartData} />
          </div>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Risk Distribution
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span>Updated today</span>
            </div>
          </div>
          <div className="h-80">
            <PieChart data={riskData} />
          </div>
        </motion.div>
      </div>

      {/* Recent Policies & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Policies
            </h2>
            <Link to="/dashboard/policies" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.policies.length > 0 ? (
              dashboardData.policies.map((policy, index) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <PolicyCard policy={{
                    id: policy.id,
                    name: policy.name,
                    policyNumber: policy.policyNumber,
                    status: policy.status,
                    type: policy.type,
                    totalPremium: policy.totalPremium,
                    totalCoverage: policy.totalCoverage,
                    endDate: policy.endDate,
                    riskScore: policy.riskScore,
                    description: `${policy.type} insurance coverage`,
                    nextPayment: policy.nextPayment
                  }} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No policies yet.</p>
                <p className="text-sm mt-2">Create your first policy to get started!</p>
                <Link to="/dashboard/policies">
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Create Policy
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Claims */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Claims
            </h2>
            <Link to="/dashboard/claims" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.claims.length > 0 ? (
              dashboardData.claims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ClaimCard {...claim} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No claims yet.</p>
                <Link to="/dashboard/claims">
                  <p className="text-sm mt-2 text-blue-600 dark:text-blue-400 hover:underline">
                    File a claim when needed
                  </p>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between text-white">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Need Assistance?</h3>
            <p className="text-emerald-100">
              Our support team is available 24/7 to help with any questions.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link to="/support">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
              >
                Contact Support
              </motion.button>
            </Link>
            <Link to="/dashboard/claims">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
              >
                File New Claim
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;