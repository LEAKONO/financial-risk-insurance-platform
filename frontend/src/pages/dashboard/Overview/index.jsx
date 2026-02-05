import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../../../components/ui/Card/StatsCard';
import PolicyCard from '../../../components/policy/PolicyCard';
import ClaimCard from '../../../components/claims/ClaimCard';
import LineChart from '../../../components/charts/LineChart';
import PieChart from '../../../components/charts/PieChart';

const DashboardOverview = () => {
  console.log('🟢 DashboardOverview rendered');

  const stats = [
    {
      title: 'Active Policies',
      value: '12',
      change: '+2',
      isPositive: true,
      icon: ShieldCheckIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Coverage',
      value: '$2.5M',
      change: '+12.5%',
      isPositive: true,
      icon: CurrencyDollarIcon,
      color: 'from-emerald-500 to-green-500'
    },
    {
      title: 'Pending Claims',
      value: '3',
      change: '-1',
      isPositive: false,
      icon: ExclamationTriangleIcon,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Risk Score',
      value: '65',
      change: '-5',
      isPositive: true,
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const recentPolicies = [
    {
      id: 1,
      name: 'Life Insurance Premium',
      policyNumber: 'POL-2024-001',
      premium: '$450',
      status: 'active',
      nextPayment: '2024-02-15',
      coverage: '$500,000',
      type: 'life',
      totalPremium: 450,
      totalCoverage: 500000,
      endDate: '2024-12-31',
      riskScore: 65
    },
    {
      id: 2,
      name: 'Health Insurance',
      policyNumber: 'POL-2024-002',
      premium: '$320',
      status: 'active',
      nextPayment: '2024-02-20',
      coverage: '$250,000',
      type: 'health',
      totalPremium: 320,
      totalCoverage: 250000,
      endDate: '2024-12-31',
      riskScore: 45
    },
    {
      id: 3,
      name: 'Auto Insurance',
      policyNumber: 'POL-2024-003',
      premium: '$180',
      status: 'pending',
      nextPayment: '2024-02-25',
      coverage: '$100,000',
      type: 'auto',
      totalPremium: 180,
      totalCoverage: 100000,
      endDate: '2024-12-31',
      riskScore: 75
    }
  ];

  const recentClaims = [
    {
      id: 1,
      claimNumber: 'CLM-2024-001',
      policyName: 'Life Insurance',
      amount: '$15,000',
      status: 'approved',
      date: '2024-01-15',
      type: 'medical'
    },
    {
      id: 2,
      claimNumber: 'CLM-2024-002',
      policyName: 'Health Insurance',
      amount: '$5,000',
      status: 'pending',
      date: '2024-01-20',
      type: 'accident'
    },
    {
      id: 3,
      claimNumber: 'CLM-2024-003',
      policyName: 'Auto Insurance',
      amount: '$3,500',
      status: 'rejected',
      date: '2024-01-25',
      type: 'collision'
    }
  ];

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

  // Transform policy data for PolicyCard component
  const getPolicyCardData = (policy) => {
    return {
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
    };
  };

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
              Welcome back, John! 👋
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your insurance portfolio today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/30 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Policy</span>
            </motion.button>
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
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <PolicyCard policy={getPolicyCardData(policy)} />
              </motion.div>
            ))}
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
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentClaims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ClaimCard {...claim} />
              </motion.div>
            ))}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
            >
              Contact Support
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all"
            >
              File New Claim
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;