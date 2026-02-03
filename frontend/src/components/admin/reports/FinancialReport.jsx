import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign,
  BarChart3, PieChart, LineChart,
  Download, Filter, Calendar,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Select } from '@/components/ui/Form/Select';
import { DatePicker } from '@/components/ui/Form/DatePicker';
import { motion } from 'framer-motion';
import { Chart } from '@/components/ui/Chart/Chart';

export const FinancialReport = ({ data, onExport }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 12)));
  const [endDate, setEndDate] = useState(new Date());
  const [metrics, setMetrics] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    claimsPaid: 0,
    premiumsCollected: 0,
    growth: 0
  });
  const [loading, setLoading] = useState(true);

  const timeRanges = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const financialMetrics = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: metrics.revenue,
      change: 12.5,
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      value: metrics.expenses,
      change: -3.2,
      trend: 'down',
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      id: 'profit',
      label: 'Net Profit',
      value: metrics.profit,
      change: 18.7,
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      id: 'claims',
      label: 'Claims Paid',
      value: metrics.claimsPaid,
      change: -8.3,
      trend: 'down',
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      id: 'premiums',
      label: 'Premiums Collected',
      value: metrics.premiumsCollected,
      change: 15.2,
      trend: 'up',
      icon: ArrowUpRight,
      color: 'bg-purple-500'
    },
    {
      id: 'growth',
      label: 'Growth Rate',
      value: metrics.growth,
      change: 22.1,
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-indigo-500'
    }
  ];

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 72000, 80000, 78000, 85000, 92000, 98000, 105000, 112000, 118000, 125000, 130000],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true
      },
      {
        label: 'Expenses',
        data: [45000, 48000, 52000, 51000, 55000, 58000, 60000, 62000, 64000, 66000, 68000, 70000],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true
      }
    ]
  };

  const expenseBreakdown = {
    labels: ['Claims', 'Salaries', 'Operations', 'Marketing', 'Technology', 'Other'],
    datasets: [
      {
        data: [45, 25, 12, 8, 6, 4],
        backgroundColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
          'rgb(107, 114, 128)'
        ]
      }
    ]
  };

  const profitabilityData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Profit Margin (%)',
        data: [18.5, 21.2, 24.8, 27.3],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }
    ]
  };

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange, startDate, endDate]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setMetrics({
        revenue: 1250000,
        expenses: 850000,
        profit: 400000,
        claimsPaid: 520000,
        premiumsCollected: 1370000,
        growth: 22.1
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of financial performance and metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onExport?.()}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="primary">
            <Eye className="w-4 h-4 mr-2" />
            View Full Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              options={timeRanges}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <DatePicker
              value={startDate.toISOString().split('T')[0]}
              onChange={(date) => setStartDate(new Date(date))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <DatePicker
              value={endDate.toISOString().split('T')[0]}
              onChange={(date) => setEndDate(new Date(date))}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={fetchFinancialData}
              disabled={loading}
            >
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {financialMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={`
                  ${metric.trend === 'up' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }
                `}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {formatPercent(metric.change)}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {metric.id === 'growth' 
                    ? `${metric.value}%` 
                    : formatCurrency(metric.value)
                  }
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.trend === 'up' ? 'Increased' : 'Decreased'} from last period
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Revenue vs Expenses
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly comparison
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </div>
          
          <div className="h-64">
            <Chart
              type="line"
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value/1000}k`
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Expense Breakdown
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Distribution of expenses
              </p>
            </div>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="h-64">
            <Chart
              type="doughnut"
              data={expenseBreakdown}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Profitability Trend */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Profitability Trend
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quarterly profit margin analysis
              </p>
            </div>
            <LineChart className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="h-64">
            <Chart
              type="line"
              data={profitabilityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
          Financial Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Gross Profit Margin</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              32.5%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +2.3% from last period
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Operating Expenses Ratio</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              68.5%
            </div>
            <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              -1.8% from last period
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Claims Ratio</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              42.3%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              -3.7% from last period
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Return on Equity</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              18.9%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +4.2% from last period
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Performance Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Reduce Claims Costs
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Implement fraud detection measures to reduce claims by 15%
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Increase Premium Efficiency
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Adjust pricing models to improve premium collection by 8%
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Optimize Operations
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Streamline processes to reduce operational costs by 12%
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Expand Market Reach
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Target new customer segments for 25% revenue growth
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};export default FinancialReport;
