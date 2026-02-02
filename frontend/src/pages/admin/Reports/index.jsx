import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardListIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon,
  CalendarIcon,
  FunnelIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';
import FinancialReport from '../../../components/admin/reports/FinancialReport';
import ReportGenerator from '../../../components/admin/reports/ReportGenerator';
import ExportOptions from '../../../components/admin/reports/ExportOptions';
import Button from '../../../components/ui/Button/Button';
import Select from '../../../components/ui/Form/Select';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const AdminReports = () => {
  const [reportType, setReportType] = useState('financial');
  const [timeRange, setTimeRange] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const reportTypes = [
    { value: 'financial', label: 'Financial Reports', icon: CurrencyDollarIcon },
    { value: 'user', label: 'User Analytics', icon: UserGroupIcon },
    { value: 'policy', label: 'Policy Reports', icon: DocumentTextIcon },
    { value: 'claim', label: 'Claim Analysis', icon: ClipboardListIcon },
    { value: 'risk', label: 'Risk Assessment', icon: ChartBarIcon },
    { value: 'system', label: 'System Performance', icon: ClockIcon }
  ];

  const timeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const financialData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [450000, 520000, 610000, 590000, 680000, 720000, 750000, 730000, 780000, 820000, 860000, 920000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Claims Paid',
        data: [120000, 150000, 180000, 140000, 210000, 190000, 230000, 210000, 240000, 220000, 260000, 250000],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const policyData = {
    labels: ['Life', 'Health', 'Auto', 'Property', 'Travel', 'Disability'],
    datasets: [
      {
        label: 'Active Policies',
        data: [5234, 4210, 3125, 1980, 1250, 435],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4'
        ]
      }
    ]
  };

  const claimDistribution = {
    labels: ['Approved', 'Pending', 'Rejected', 'Processing'],
    datasets: [
      {
        data: [68, 18, 8, 6],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#3b82f6'
        ]
      }
    ]
  };

  const kpis = [
    {
      title: 'Total Revenue',
      value: '$9.2M',
      change: '+18.7%',
      isPositive: true,
      trend: 'up',
      description: 'Year-to-date revenue'
    },
    {
      title: 'New Policies',
      value: '2,847',
      change: '+12.5%',
      isPositive: true,
      trend: 'up',
      description: 'Policies issued this year'
    },
    {
      title: 'Claim Ratio',
      value: '27.2%',
      change: '-3.1%',
      isPositive: true,
      trend: 'down',
      description: 'Claims paid vs premiums'
    },
    {
      title: 'Customer Growth',
      value: '+1,842',
      change: '+15.3%',
      isPositive: true,
      trend: 'up',
      description: 'New customers this year'
    }
  ];

  const recentReports = [
    { name: 'Q4 2023 Financial Report', date: '2024-01-15', type: 'PDF', size: '4.2 MB' },
    { name: 'Annual User Analytics', date: '2024-01-10', type: 'Excel', size: '8.7 MB' },
    { name: 'Monthly Claim Analysis', date: '2024-01-05', type: 'PDF', size: '3.1 MB' },
    { name: 'Risk Assessment Summary', date: '2023-12-28', type: 'PDF', size: '5.6 MB' }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setIsExportOpen(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate insights and analytics reports
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            options={timeOptions}
            className="w-40"
          />
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => setIsExportOpen(true)}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Report Type
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Select a report category
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setReportType(type.value)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                reportType === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <type.icon className={`w-8 h-8 mb-2 ${
                reportType === type.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                reportType === type.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {type.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {kpi.title}
              </div>
              <div className={`p-2 rounded-lg ${
                kpi.trend === 'up'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {kpi.trend === 'up' ? (
                  <TrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {kpi.value}
            </div>
            
            <div className={`text-sm font-medium ${
              kpi.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {kpi.isPositive ? '↗' : '↘'} {kpi.change}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {kpi.description}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Financial Performance
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Revenue vs Claims (2023)
              </p>
            </div>
            <CurrencyDollarIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div className="h-80">
            <LineChart data={financialData} />
          </div>
        </motion.div>

        {/* Policy Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Policy Distribution
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                By insurance type
              </p>
            </div>
            <DocumentTextIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div className="h-80">
            <BarChart data={policyData} />
          </div>
        </motion.div>
      </div>

      {/* Claim Distribution & Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Claim Distribution
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                By status
              </p>
            </div>
            <ClipboardListIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div className="h-64">
            <PieChart data={claimDistribution} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">68%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">18%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </motion.div>

        {/* Report Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Generate Custom Report</h3>
              <p className="text-blue-100">
                Create detailed reports with custom parameters
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 opacity-80" />
          </div>
          
          <ReportGenerator
            reportType={reportType}
            timeRange={timeRange}
            isGenerating={isGenerating}
            onGenerate={handleGenerateReport}
          />
        </motion.div>
      </div>

      {/* Financial Report */}
      {reportType === 'financial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FinancialReport timeRange={timeRange} />
        </motion.div>
      )}

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Previously generated reports
            </p>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            View all
          </button>
        </div>
        
        <div className="space-y-4">
          {recentReports.map((report, index) => (
            <div
              key={report.name}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Generated on {report.date}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {report.type}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {report.size}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <PrinterIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export Options Modal */}
      <ExportOptions
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportType={reportType}
      />
    </div>
  );
};

export default AdminReports;