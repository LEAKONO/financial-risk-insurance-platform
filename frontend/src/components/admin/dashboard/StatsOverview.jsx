import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, DollarSign, TrendingUp,
  Activity, Shield, Clock, AlertCircle
} from 'lucide-react';
import { adminService } from "../../../services/api";
import { Loader, Toast } from '../../common';

export const StatsOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats(timeRange);
      setStats(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load dashboard statistics' });
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  if (loading && !stats) return <Loader />;

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistics Overview</h2>
          <p className="text-gray-600">Key metrics and performance indicators</p>
        </div>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth || 0}
          icon={<Users className="text-blue-500" />}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Active Policies"
          value={stats?.activePolicies || 0}
          change={stats?.policyGrowth || 0}
          icon={<FileText className="text-green-500" />}
          color="green"
          delay={0.1}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          change={stats?.revenueGrowth || 0}
          icon={<DollarSign className="text-yellow-500" />}
          color="yellow"
          delay={0.2}
        />
        <StatCard
          title="Pending Claims"
          value={stats?.pendingClaims || 0}
          change={stats?.claimGrowth || 0}
          icon={<AlertCircle className="text-red-500" />}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PerformanceCard
          title="Approval Rate"
          value={stats?.approvalRate || 0}
          target={85}
          icon={<Activity className="text-purple-500" />}
        />
        <PerformanceCard
          title="Average Processing Time"
          value={stats?.avgProcessingTime || 0}
          unit="hours"
          target={24}
          icon={<Clock className="text-indigo-500" />}
        />
        <PerformanceCard
          title="Risk Score"
          value={stats?.avgRiskScore || 0}
          target={30}
          icon={<Shield className="text-emerald-500" />}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricGrid
          title="User Metrics"
          metrics={[
            { label: 'New Registrations', value: stats?.newRegistrations || 0 },
            { label: 'Active Users', value: stats?.activeUsers || 0 },
            { label: 'Admin Users', value: stats?.adminUsers || 0 },
            { label: 'Customer Users', value: stats?.customerUsers || 0 }
          ]}
          color="blue"
        />
        <MetricGrid
          title="Claim Metrics"
          metrics={[
            { label: 'Submitted', value: stats?.submittedClaims || 0 },
            { label: 'Approved', value: stats?.approvedClaims || 0 },
            { label: 'Rejected', value: stats?.rejectedClaims || 0 },
            { label: 'Under Review', value: stats?.underReviewClaims || 0 }
          ]}
          color="green"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color, delay = 0 }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          change > 0 ? 'bg-green-100 text-green-800' :
          change < 0 ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    </motion.div>
  );
};

const PerformanceCard = ({ title, value, target, unit = '%', icon }) => {
  const percentage = Math.min((value / target) * 100, 100);
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-2xl font-bold">{value}{unit}</div>
      </div>
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Current</span>
          <span>Target: {target}{unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-2 rounded-full ${
              percentage >= 90 ? 'bg-green-500' :
              percentage >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <span className={percentage >= 100 ? 'text-green-600' : 'text-yellow-600'}>
            {percentage >= 100 ? 'Target Achieved' : `${(target - value).toFixed(1)}${unit} to target`}
          </span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

const MetricGrid = ({ title, metrics, color }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    purple: 'border-purple-200 bg-purple-50'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className={`p-4 border rounded-lg ${colorClasses[color]}`}
          >
            <div className="text-sm text-gray-500">{metric.label}</div>
            <div className="text-2xl font-bold mt-2">{metric.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatsOverview;