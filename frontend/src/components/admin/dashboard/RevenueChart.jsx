import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, Download, Filter,
  ChevronDown, Calendar, BarChart3, PieChart
} from 'lucide-react';
import { adminService } from "../../../services/api";
import { Loader, Toast } from '../../common';
import { LineChart } from '../../charts/LineChart';
import { BarChart } from '../../charts/BarChart';

export const RevenueChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRevenueData(timeRange);
      setData(response);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load revenue data' });
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

  if (loading && !data) return <Loader />;

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
          <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-600">Track revenue performance and trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Selector */}
          <div className="relative">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer">
              {chartTypes.find(t => t.value === chartType)?.icon}
              <span className="font-medium">
                {chartTypes.find(t => t.value === chartType)?.label}
              </span>
              <ChevronDown size={16} />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10 hidden group-hover:block">
              {chartTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 ${
                    chartType === type.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Selector */}
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

          {/* Export Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatBox
          title="Total Revenue"
          value={`$${(data?.totalRevenue || 0).toLocaleString()}`}
          change={data?.revenueGrowth || 0}
          icon={<DollarSign className="text-green-500" />}
        />
        <StatBox
          title="Average Daily"
          value={`$${(data?.averageDaily || 0).toLocaleString()}`}
          change={data?.dailyGrowth || 0}
          icon={<TrendingUp className="text-blue-500" />}
        />
        <StatBox
          title="Recurring Revenue"
          value={`$${(data?.recurringRevenue || 0).toLocaleString()}`}
          change={data?.recurringGrowth || 0}
          icon={<PieChart className="text-purple-500" />}
        />
        <StatBox
          title="New Revenue"
          value={`$${(data?.newRevenue || 0).toLocaleString()}`}
          change={data?.newRevenueGrowth || 0}
          icon={<Calendar className="text-yellow-500" />}
        />
      </div>

      {/* Chart */}
      <div className="h-80 mb-8">
        {chartType === 'line' ? (
          <LineChart
            data={data?.chartData || []}
            xField="date"
            yField="revenue"
            title="Revenue Over Time"
            color="#4f46e5"
          />
        ) : (
          <BarChart
            data={data?.chartData || []}
            xField="date"
            yField="revenue"
            title="Revenue by Period"
            color="#10b981"
          />
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BreakdownItem
            title="Policy Premiums"
            value={data?.breakdown?.premiums || 0}
            percentage={data?.breakdown?.premiumsPercentage || 0}
            color="blue"
          />
          <BreakdownItem
            title="Renewals"
            value={data?.breakdown?.renewals || 0}
            percentage={data?.breakdown?.renewalsPercentage || 0}
            color="green"
          />
          <BreakdownItem
            title="Additional Coverage"
            value={data?.breakdown?.additional || 0}
            percentage={data?.breakdown?.additionalPercentage || 0}
            color="purple"
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatBox = ({ title, value, change, icon }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 rounded-lg p-4"
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

const BreakdownItem = ({ title, value, percentage, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{title}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
          {percentage}%
        </span>
      </div>
      <div className="text-2xl font-bold">${value.toLocaleString()}</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-2 rounded-full ${
            color === 'blue' ? 'bg-blue-500' :
            color === 'green' ? 'bg-green-500' : 'bg-purple-500'
          }`}
        />
      </div>
    </div>
  );
};

export default RevenueChart;