import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Shield, TrendingUp, Users,
  BarChart3, Filter, Download, RefreshCw
} from 'lucide-react';
import { adminService } from "../../../services/api";
import { Loader, Toast } from '../../common';
import { DonutChart } from '../../charts/DonutChart';
import { BarChart } from '../../charts/BarChart';

export const RiskDistributionChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [chartType, setChartType] = useState('donut');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchRiskData();
  }, [timeRange]);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRiskDistribution(timeRange);
      setData(response);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load risk distribution data' });
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
    { value: 'donut', label: 'Donut Chart', icon: <Shield size={18} /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 size={18} /> }
  ];

  if (loading && !data) return <Loader />;

  // Prepare data for charts
  const donutData = data?.distribution?.map(item => ({
    label: item.category,
    value: item.count,
    color: getRiskColor(item.category)
  })) || [];

  const barData = data?.trends?.map(item => ({
    category: item.month,
    value: item.highRisk
  })) || [];

  const getRiskColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'high': return <AlertTriangle className="text-red-500" />;
      case 'medium': return <AlertTriangle className="text-yellow-500" />;
      case 'low': return <Shield className="text-green-500" />;
      default: return <Shield className="text-gray-500" />;
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
          <h2 className="text-xl font-bold text-gray-900">Risk Distribution</h2>
          <p className="text-gray-600">Analyze risk profiles across policies</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Selector */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  chartType === type.value
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
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Action Buttons */}
          <button
            onClick={fetchRiskData}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Risk Profiles"
          value={data?.totalProfiles || 0}
          change={data?.profileGrowth || 0}
          icon={<Users className="text-blue-500" />}
        />
        <StatCard
          title="High Risk Policies"
          value={data?.highRiskCount || 0}
          change={data?.highRiskGrowth || 0}
          icon={<AlertTriangle className="text-red-500" />}
          warning
        />
        <StatCard
          title="Avg Risk Score"
          value={data?.averageScore || 0}
          change={data?.scoreChange || 0}
          icon={<TrendingUp className="text-green-500" />}
        />
      </div>

      {/* Chart Section */}
      <div className="h-80 mb-8">
        {chartType === 'donut' ? (
          <DonutChart
            data={donutData}
            width={400}
            height={300}
            title="Risk Category Distribution"
            showLegend={true}
            showLabels={true}
            innerRadius={0.5}
            colors={['#ef4444', '#f59e0b', '#10b981']}
          />
        ) : (
          <BarChart
            data={barData}
            width={600}
            height={300}
            title="High Risk Trends"
            color="#ef4444"
            showValues={true}
            showGrid={true}
          />
        )}
      </div>

      {/* Risk Details */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-800 mb-4">Risk Category Details</h3>
        <div className="space-y-4">
          {data?.distribution?.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  item.category === 'High' ? 'bg-red-100' :
                  item.category === 'Medium' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  {getRiskIcon(item.category)}
                </div>
                <div>
                  <div className="font-semibold">{item.category} Risk</div>
                  <div className="text-sm text-gray-500">
                    {item.count} policies • {((item.count / data.totalProfiles) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${item.averagePremium?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-500">Avg Premium</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      {data?.topFactors && data.topFactors.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-800 mb-4">Top Risk Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topFactors.map((factor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{factor.factor}</span>
                  <span className="text-sm text-gray-500">{factor.count}x</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(factor.count / data.topFactors[0].count) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-2 rounded-full bg-indigo-500"
                  />
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ title, value, change, icon, warning = false }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border ${
        warning 
          ? 'border-red-200 bg-red-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-500">{title}</div>
        {icon}
      </div>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className={`text-sm ${
        change > 0 && !warning ? 'text-green-600' :
        change < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {change > 0 ? '+' : ''}{change}% from previous period
      </div>
    </motion.div>
  );
};

export default RiskDistributionChart;