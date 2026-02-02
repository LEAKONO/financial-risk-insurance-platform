import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, UserPlus, UserCheck,
  Download, Filter, Calendar, BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { adminService } from '../../../services/admin.service';
import { Loader, Toast } from '../../common';
import { LineChart } from '../../charts/LineChart';
import { BarChart } from '../../charts/BarChart';
import { DonutChart } from '../../charts/DonutChart';

export const UserGrowthChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [viewType, setViewType] = useState('growth');

  useEffect(() => {
    fetchUserData();
  }, [timeRange]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserGrowthData(timeRange);
      setData(response);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load user growth data' });
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' }
  ];

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: <TrendingUp size={18} /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 size={18} /> }
  ];

  const viewTypes = [
    { value: 'growth', label: 'Growth', icon: <UserPlus size={18} /> },
    { value: 'active', label: 'Active Users', icon: <UserCheck size={18} /> },
    { value: 'total', label: 'Total Users', icon: <Users size={18} /> }
  ];

  if (loading && !data) return <Loader />;

  // Prepare chart data
  const prepareChartData = () => {
    if (!data || !data.growthData) return [];
    
    return data.growthData.map(item => ({
      date: item.date,
      value: item[viewType] || item.growth || 0
    }));
  };

  // Prepare role distribution data
  const roleData = data?.roleDistribution?.map(item => ({
    label: item.role,
    value: item.count,
    color: getRoleColor(item.role)
  })) || [];

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#ef4444';
      case 'underwriter': return '#f59e0b';
      case 'customer': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Growth Analytics</h2>
          <p className="text-gray-600">Track user acquisition and engagement</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* View Type Selector */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {viewTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setViewType(type.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  viewType === type.value
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type.icon}
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={data?.totalUsers || 0}
          change={data?.totalGrowth || 0}
          icon={<Users className="text-blue-500" />}
        />
        <MetricCard
          title="New Users"
          value={data?.newUsers || 0}
          change={data?.newUserGrowth || 0}
          icon={<UserPlus className="text-green-500" />}
        />
        <MetricCard
          title="Active Users"
          value={data?.activeUsers || 0}
          change={data?.activeGrowth || 0}
          icon={<UserCheck className="text-purple-500" />}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${data?.engagementRate || 0}%`}
          change={data?.engagementChange || 0}
          icon={<TrendingUp className="text-yellow-500" />}
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="h-80">
            {chartType === 'line' ? (
              <LineChart
                data={prepareChartData()}
                xField="date"
                yField="value"
                title={`User ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} Over Time`}
                color="#4f46e5"
                showGrid={true}
                showPoints={true}
              />
            ) : (
              <BarChart
                data={prepareChartData()}
                xField="date"
                yField="value"
                title={`User ${viewType.charAt(0).toUpperCase() + viewType.slice(1)} by Period`}
                color="#10b981"
                showValues={true}
                showGrid={true}
              />
            )}
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex justify-center mt-4 space-x-4">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  chartType === type.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Role Distribution</h3>
            <PieChartIcon className="text-gray-400" size={20} />
          </div>
          <div className="h-64">
            <DonutChart
              data={roleData}
              width={250}
              height={250}
              showLegend={true}
              showLabels={true}
              innerRadius={0.5}
            />
          </div>
          <div className="mt-4 space-y-3">
            {data?.roleDistribution?.map((role, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getRoleColor(role.role) }}
                  />
                  <span className="font-medium capitalize">{role.role}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{role.count}</div>
                  <div className="text-sm text-gray-500">
                    {((role.count / data.totalUsers) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Acquisition Channels */}
      {data?.acquisitionChannels && data.acquisitionChannels.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Acquisition Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.acquisitionChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getChannelIcon(channel.channel)}
                    </div>
                    <div>
                      <div className="font-semibold">{channel.channel}</div>
                      <div className="text-sm text-gray-500">{channel.users} users</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {channel.percentage}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${channel.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-2 rounded-full bg-indigo-500"
                  />
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Conversion rate: {channel.conversionRate}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* User Activity */}
      {data?.activityData && data.activityData.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-800 mb-4">User Activity Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.activityData.map((metric, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">{metric.label}</div>
                <div className="text-2xl font-bold mb-2">{metric.value}</div>
                <div className={`text-sm ${
                  metric.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const MetricCard = ({ title, value, change, icon }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-sm mt-2 ${
        change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {change > 0 ? '+' : ''}{change}% from previous period
      </div>
    </motion.div>
  );
};

const getChannelIcon = (channel) => {
  switch (channel?.toLowerCase()) {
    case 'organic':
      return <TrendingUp size={20} className="text-green-500" />;
    case 'referral':
      return <Users size={20} className="text-blue-500" />;
    case 'social':
      return <Users size={20} className="text-purple-500" />;
    case 'direct':
      return <UserPlus size={20} className="text-yellow-500" />;
    default:
      return <UserPlus size={20} className="text-gray-500" />;
  }
};

export default UserGrowthChart;