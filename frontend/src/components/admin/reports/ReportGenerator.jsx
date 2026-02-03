import React, { useState, useEffect } from 'react';
import {
  FileText, BarChart3, PieChart,
  Download, Filter, Calendar,
  Settings, Play, RefreshCw,
  ChevronRight, CheckCircle,
  AlertCircle, Clock, Users
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Select } from '@/components/ui/Form/Select';
import { DatePicker } from '@/components/ui/Form/DatePicker';
import { Input } from '@/components/ui/Form/Input';
import { TextArea } from '@/components/ui/Form/TextArea';
import { motion, AnimatePresence } from 'framer-motion';

const reportTemplates = [
  {
    id: 'financial',
    name: 'Financial Report',
    description: 'Comprehensive financial performance analysis',
    icon: BarChart3,
    color: 'bg-green-500',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'claims',
    name: 'Claims Analysis',
    description: 'Detailed claims statistics and trends',
    icon: FileText,
    color: 'bg-blue-500',
    estimatedTime: '1-2 minutes'
  },
  {
    id: 'customer',
    name: 'Customer Insights',
    description: 'Customer behavior and demographics',
    icon: Users,
    color: 'bg-purple-500',
    estimatedTime: '3-4 minutes'
  },
  {
    id: 'risk',
    name: 'Risk Assessment',
    description: 'Risk exposure and management metrics',
    icon: AlertCircle,
    color: 'bg-orange-500',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'operational',
    name: 'Operational Report',
    description: 'Operational efficiency metrics',
    icon: Settings,
    color: 'bg-indigo-500',
    estimatedTime: '1-2 minutes'
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build your own report with custom metrics',
    icon: PieChart,
    color: 'bg-pink-500',
    estimatedTime: '5+ minutes'
  }
];

const reportMetrics = [
  { id: 'revenue', label: 'Revenue', category: 'financial' },
  { id: 'expenses', label: 'Expenses', category: 'financial' },
  { id: 'profit', label: 'Profit', category: 'financial' },
  { id: 'claimsCount', label: 'Claims Count', category: 'claims' },
  { id: 'claimsAmount', label: 'Claims Amount', category: 'claims' },
  { id: 'fraudCases', label: 'Fraud Cases', category: 'claims' },
  { id: 'customerCount', label: 'Customer Count', category: 'customer' },
  { id: 'retentionRate', label: 'Retention Rate', category: 'customer' },
  { id: 'satisfaction', label: 'Satisfaction Score', category: 'customer' },
  { id: 'riskScore', label: 'Risk Score', category: 'risk' },
  { id: 'coverageRatio', label: 'Coverage Ratio', category: 'risk' },
  { id: 'processingTime', label: 'Processing Time', category: 'operational' },
  { id: 'efficiency', label: 'Efficiency Rate', category: 'operational' },
  { id: 'costPerClaim', label: 'Cost Per Claim', category: 'operational' }
];

export const ReportGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('financial');
  const [reportName, setReportName] = useState('');
  const [description, setDescription] = useState('');
  const [timeRange, setTimeRange] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 12)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);

  const timeRanges = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    // Auto-set report name based on template
    if (!reportName) {
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setReportName(`${template.name} - ${new Date().toLocaleDateString()}`);
      }
    }

    // Auto-select metrics based on template
    if (selectedTemplate !== 'custom') {
      const templateMetrics = reportMetrics
        .filter(metric => metric.category === selectedTemplate)
        .map(metric => metric.id);
      setSelectedMetrics(templateMetrics);
    }
  }, [selectedTemplate]);

  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const selectAllMetrics = () => {
    const templateMetrics = reportMetrics
      .filter(metric => metric.category === selectedTemplate)
      .map(metric => metric.id);
    setSelectedMetrics(templateMetrics);
  };

  const deselectAllMetrics = () => {
    setSelectedMetrics([]);
  };

  const validateForm = () => {
    if (!reportName.trim()) {
      setError('Please enter a report name');
      return false;
    }
    if (selectedMetrics.length === 0) {
      setError('Please select at least one metric');
      return false;
    }
    return true;
  };

  const generateReport = async () => {
    if (!validateForm()) return;

    setGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate report generation process
      const totalSteps = 5;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress((i / totalSteps) * 100);

        // Simulate potential errors
        if (i === 3 && Math.random() < 0.1) {
          throw new Error('Data processing failed. Please try again.');
        }
      }

      // Create report object
      const report = {
        id: `report_${Date.now()}`,
        name: reportName,
        template: selectedTemplate,
        metrics: selectedMetrics,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString(),
        size: '2.5 MB',
        format: 'PDF',
        downloadUrl: '#'
      };

      setGeneratedReport(report);
      setGenerating(false);
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setReportName('');
    setDescription('');
    setSelectedTemplate('financial');
    setSelectedMetrics([]);
    setGeneratedReport(null);
    setError(null);
  };

  const downloadReport = () => {
    if (generatedReport) {
      // Trigger download
      const link = document.createElement('a');
      link.href = generatedReport.downloadUrl;
      link.download = `${reportName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getTemplateMetrics = () => {
    return reportMetrics.filter(metric => metric.category === selectedTemplate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Report Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create custom reports with real-time data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={generating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Template Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Select Report Template
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {reportTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${template.color} p-2 rounded-lg`}>
                      <template.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {template.estimatedTime}
                        </span>
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Report Configuration */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Report Configuration
            </h2>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Name *
                  </label>
                  <Input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                  />
                </div>
                
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the report..."
                  rows={2}
                />
              </div>

              {/* Metrics Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Select Metrics
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllMetrics}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={deselectAllMetrics}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getTemplateMetrics().map((metric) => (
                    <label
                      key={metric.id}
                      className={`
                        flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                        ${selectedMetrics.includes(metric.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric.id)}
                        onChange={() => toggleMetric(metric.id)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded border mr-3 flex items-center justify-center
                        ${selectedMetrics.includes(metric.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {selectedMetrics.includes(metric.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {metric.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Additional Options
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Include Charts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Add visual charts
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCharts}
                        onChange={(e) => setIncludeCharts(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Include Summary
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Add executive summary
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSummary}
                        onChange={(e) => setIncludeSummary(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Include Recommendations
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Add actionable insights
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeRecommendations}
                        onChange={(e) => setIncludeRecommendations(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Preview & Actions */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Report Preview
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Report Name</div>
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {reportName || 'Untitled Report'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Template</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Selected Metrics</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedMetrics.length} metrics
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedMetrics.slice(0, 3).map(id => 
                    reportMetrics.find(m => m.id === id)?.label
                  ).join(', ')}
                  {selectedMetrics.length > 3 && ` +${selectedMetrics.length - 3} more`}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Range</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {timeRanges.find(t => t.value === timeRange)?.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Size</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  ~2-5 MB
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on selected metrics and options
                </div>
              </div>
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateReport}
            disabled={generating || !reportName || selectedMetrics.length === 0}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Generate Report
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {generating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs text-gray-500">
                Collecting data, processing metrics, generating charts...
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800 dark:text-red-300">
                    Generation Failed
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generated Report */}
          {generatedReport && (
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Report Generated Successfully!
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Report ID</div>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {generatedReport.id}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Generated At</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {new Date(generatedReport.generatedAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">File Size</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {generatedReport.size}
                      </div>
                    </div>
                    
                    <Button
                      onClick={downloadReport}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Tips */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Tips for Better Reports
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Use specific, descriptive report names</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Select relevant time ranges for your analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Include charts for visual representation</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Add recommendations for actionable insights</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};export default ReportGenerator;
