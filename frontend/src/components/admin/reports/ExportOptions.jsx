import React, { useState } from 'react';
import {
  Download, FileText, FileSpreadsheet,
  FilePieChart, Mail, Printer,
  ChevronDown, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export const ExportOptions = ({ data, reportType, onExport, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeData, setIncludeData] = useState(true);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [emailExport, setEmailExport] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [scheduledExport, setScheduledExport] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);

  const exportFormats = [
    { id: 'pdf', label: 'PDF Document', icon: FileText, color: 'bg-red-100 text-red-800' },
    { id: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, color: 'bg-green-100 text-green-800' },
    { id: 'csv', label: 'CSV File', icon: FileSpreadsheet, color: 'bg-blue-100 text-blue-800' },
    { id: 'json', label: 'JSON Data', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'html', label: 'HTML Report', icon: FilePieChart, color: 'bg-purple-100 text-purple-800' }
  ];

  const scheduleOptions = [
    { id: 'daily', label: 'Daily', description: 'Every day at 9:00 AM' },
    { id: 'weekly', label: 'Weekly', description: 'Every Monday at 9:00 AM' },
    { id: 'monthly', label: 'Monthly', description: 'First day of month at 9:00 AM' },
    { id: 'quarterly', label: 'Quarterly', description: 'First day of quarter at 9:00 AM' },
    { id: 'yearly', label: 'Yearly', description: 'January 1st at 9:00 AM' }
  ];

  const compressionOptions = [
    { id: 'none', label: 'None', description: 'Original quality', size: 'Large' },
    { id: 'low', label: 'Low', description: 'Slight compression', size: 'Medium' },
    { id: 'medium', label: 'Medium', description: 'Balanced quality/size', size: 'Small' },
    { id: 'high', label: 'High', description: 'Maximum compression', size: 'Very Small' }
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const exportConfig = {
        format: selectedFormat,
        includeCharts,
        includeData,
        compression: compressionLevel,
        email: emailExport ? emailAddress : null,
        schedule: scheduledExport ? scheduleFrequency : null,
        timestamp: new Date().toISOString()
      };

      await onExport(exportConfig);
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormatDetails = (format) => {
    const details = {
      pdf: { description: 'Best for printing and sharing', fileSize: '~2-5 MB' },
      excel: { description: 'Best for data analysis', fileSize: '~1-3 MB' },
      csv: { description: 'Best for database import', fileSize: '~0.5-2 MB' },
      json: { description: 'Best for API consumption', fileSize: '~1-4 MB' },
      html: { description: 'Best for web viewing', fileSize: '~3-6 MB' }
    };
    return details[format] || details.pdf;
  };

  const formatDetails = getFormatDetails(selectedFormat);

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Export Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and export your {reportType} report
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Format Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Select Export Format
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200
                    ${selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-lg ${format.color} mb-2`}>
                      <format.icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format.label}
                    </span>
                    {selectedFormat === format.id && (
                      <div className="mt-2">
                        <Check className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFormat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {exportFormats.find(f => f.id === selectedFormat)?.label}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDetails.description}
                    </p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {formatDetails.fileSize}
                </Badge>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Export Options */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Export Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Include Charts & Graphs
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Export visual representations of data
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
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Include Raw Data
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Export underlying data tables
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeData}
                      onChange={(e) => setIncludeData(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                    Compression Level
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {compressionOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setCompressionLevel(option.id)}
                        className={`
                          p-2 rounded text-center transition-colors
                          ${compressionLevel === option.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.size}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Export */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Email Export
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailExport}
                  onChange={(e) => setEmailExport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <AnimatePresence>
              {emailExport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      The report will be sent as an attachment to this email address
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scheduled Export */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FilePieChart className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  Schedule Export
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduledExport}
                  onChange={(e) => setScheduledExport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <AnimatePresence>
              {scheduledExport && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <div className="space-y-2">
                      {scheduleOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center justify-between p-2 hover:bg-green-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-4 h-4 rounded-full border-2 flex items-center justify-center
                              ${scheduleFrequency === option.id
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 dark:border-gray-600'
                              }
                            `}>
                              {scheduleFrequency === option.id && (
                                <Check className="w-2 h-2 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {option.description}
                              </div>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="schedule"
                            value={option.id}
                            checked={scheduleFrequency === option.id}
                            onChange={(e) => setScheduleFrequency(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Export Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Format:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {exportFormats.find(f => f.id === selectedFormat)?.label}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Charts:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {includeCharts ? 'Included' : 'Excluded'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Raw Data:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {includeData ? 'Included' : 'Excluded'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Compression:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {compressionOptions.find(c => c.id === compressionLevel)?.label}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {emailExport ? emailAddress || 'Not set' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {scheduledExport ? scheduleOptions.find(s => s.id === scheduleFrequency)?.label : 'No'}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Estimated Size:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatDetails.fileSize}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleExport}
              disabled={loading || (emailExport && !emailAddress)}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Export Report
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Preview
            </Button>
            
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
            >
              Cancel Export
            </Button>
          </div>

          {/* Quick Export Tips */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Quick Tips
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• PDF is best for sharing and printing</li>
              <li>• Excel is best for data analysis</li>
              <li>• Use compression for large reports</li>
              <li>• Schedule exports for recurring reports</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};