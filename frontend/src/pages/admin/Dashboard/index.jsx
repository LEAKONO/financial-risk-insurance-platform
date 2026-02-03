import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import StatsOverview from '../../../components/admin/dashboard/StatsOverview';
import RevenueChart from '../../../components/admin/dashboard/RevenueChart';
import RiskDistributionChart from '../../../components/admin/dashboard/RiskDistributionChart';
import UserGrowthChart from '../../../components/admin/dashboard/UserGrowthChart';
import RecentActivity from '../../../components/admin/dashboard/RecentActivity';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      isPositive: true,
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Policies',
      value: '15,234',
      change: '+8.2%',
      isPositive: true,
      icon: DocumentTextIcon,
      color: 'from-emerald-500 to-green-500'
    },
    {
      title: 'Pending Claims',
      value: '342',
      change: '-3.1%',
      isPositive: false,
      icon: ClipboardDocumentListIcon,
      color: 'from-orange-500 to-yellow-500'
    },
    {
      title: 'Revenue',
      value: '$2.8M',
      change: '+18.7%',
      isPositive: true,
      icon: CurrencyDollarIcon,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const topPolicies = [
    { name: 'Life Insurance Gold', premium: '$450', growth: '+12%', status: 'active' },
    { name: 'Health Premium', premium: '$320', growth: '+8%', status: 'active' },
    { name: 'Auto Comprehensive', premium: '$180', growth: '+15%', status: 'active' },
    { name: 'Property Plus', premium: '$220', growth: '+5%', status: 'active' }
  ];

  const recentClaims = [
    { id: 'CLM-2024-001', amount: '$15,000', status: 'approved', date: '2 hours ago' },
    { id: 'CLM-2024-002', amount: '$5,000', status: 'pending', date: '4 hours ago' },
    { id: 'CLM-2024-003', amount: '$3,500', status: 'rejected', date: '1 day ago' },
    { id: 'CLM-2024-004', amount: '$12,000', status: 'processing', date: '2 days ago' }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of system performance and analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Revenue Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monthly revenue trends
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <ArrowTrendingUpIcon className="w-5 h-5 mr-1" />
                <span className="font-semibold">+18.7%</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <RevenueChart />
          </div>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                User Growth
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                New user registrations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <UserGroupIcon className="w-5 h-5 mr-1" />
                <span className="font-semibold">+2847</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <UserGrowthChart />
          </div>
        </motion.div>
      </div>

      {/* Risk Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Risk Distribution
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Across all user profiles
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Updated today
            </div>
          </div>
          <div className="h-64">
            <RiskDistributionChart />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">42%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">31%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">18%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Very High</div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View all
            </button>
          </div>
          <RecentActivity />
        </motion.div>
      </div>

      {/* Top Policies & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Policies */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Top Performing Policies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                By premium and growth
              </p>
            </div>
            <ChartBarIcon className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topPolicies.map((policy, index) => (
              <div
                key={policy.name}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {policy.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Monthly Premium: {policy.premium}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    policy.growth.startsWith('+') 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {policy.growth}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Growth
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Claims */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Claims
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Latest claim activities
              </p>
            </div>
            <ClipboardDocumentListIcon className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {claim.id}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {claim.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {claim.amount}
                  </div>
                  <div className={`text-xs font-medium ${
                    claim.status === 'approved' 
                      ? 'text-green-600 dark:text-green-400'
                      : claim.status === 'pending'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : claim.status === 'processing'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">System Health</h3>
            <p className="text-gray-300">
              All systems operational
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-gray-300">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">0.2s</div>
              <div className="text-sm text-gray-300">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">0</div>
              <div className="text-sm text-gray-300">Active Issues</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;