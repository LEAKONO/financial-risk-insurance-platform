import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, 
  Percent, Shield, AlertCircle, Download,
  Calendar, Repeat, ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { policyService } from '@/services/policy.service';

export const PremiumBreakdown = ({ policyId, onPayment }) => {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPremiumBreakdown();
    fetchPaymentHistory();
  }, [policyId]);

  const fetchPremiumBreakdown = async () => {
    try {
      setLoading(true);
      const response = await policyService.getPremiumBreakdown(policyId);
      setBreakdown(response.data);
    } catch (error) {
      console.error('Failed to fetch premium breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await policyService.getPaymentHistory(policyId);
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Premium breakdown not available</p>
      </div>
    );
  }

  const calculateTotal = () => {
    return breakdown.basePremium + breakdown.riskAdjustment + breakdown.fees + breakdown.taxes;
  };

  const total = calculateTotal();

  const sections = [
    {
      label: 'Base Premium',
      value: breakdown.basePremium,
      description: 'Standard premium for selected coverage',
      color: 'bg-blue-500'
    },
    {
      label: 'Risk Adjustment',
      value: breakdown.riskAdjustment,
      description: `Based on ${breakdown.riskMultiplier}x risk multiplier`,
      color: breakdown.riskAdjustment >= 0 ? 'bg-red-500' : 'bg-green-500'
    },
    {
      label: 'Administrative Fees',
      value: breakdown.fees,
      description: 'Processing and service fees',
      color: 'bg-gray-500'
    },
    {
      label: 'Taxes',
      value: breakdown.taxes,
      description: 'Government taxes and levies',
      color: 'bg-purple-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Premium Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Premium Breakdown
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Shield className="w-3 h-3" />
                Policy #{breakdown.policyNumber}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Updated {formatDate(breakdown.updatedAt)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(total)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {breakdown.frequency === 'monthly' ? 'per month' : 'per year'}
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => onPayment?.('monthly')}
          >
            <DollarSign className="w-6 h-6 mb-2" />
            <span>Monthly</span>
            <span className="text-lg font-bold mt-1">
              {formatCurrency(total)}
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => onPayment?.('quarterly')}
          >
            <Calendar className="w-6 h-6 mb-2" />
            <span>Quarterly</span>
            <span className="text-lg font-bold mt-1">
              {formatCurrency(total * 3)}
            </span>
            <Badge className="mt-1 bg-green-100 text-green-800">
              Save 5%
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => onPayment?.('semi-annual')}
          >
            <Calendar className="w-6 h-6 mb-2" />
            <span>Semi-Annual</span>
            <span className="text-lg font-bold mt-1">
              {formatCurrency(total * 6)}
            </span>
            <Badge className="mt-1 bg-green-100 text-green-800">
              Save 8%
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            onClick={() => onPayment?.('annual')}
          >
            <Calendar className="w-6 h-6 mb-2" />
            <span>Annual</span>
            <span className="text-lg font-bold mt-1">
              {formatCurrency(total * 12)}
            </span>
            <Badge className="mt-1 bg-green-100 text-green-800">
              Save 12%
            </Badge>
          </Button>
        </div>
      </Card>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Premium Components
            </h3>
            
            <div className="space-y-4">
              {sections.map((section, index) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${section.color} w-3 h-3 rounded-full`} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {section.label}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      section.value >= 0 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(Math.abs(section.value))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((section.value / total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Total */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      Total Premium
                    </h4>
                    <p className="text-sm text-gray-500">
                      {breakdown.frequency === 'monthly' ? 'Monthly payment' : 'Annual payment'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {breakdown.frequency === 'monthly' ? 'per month' : 'per year'}
                  </p>
                </div>
              </motion.div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Profile */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Risk Profile
              </h3>
              <Badge className={
                breakdown.riskMultiplier < 1 ? 'bg-green-100 text-green-800' :
                breakdown.riskMultiplier < 1.5 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {breakdown.riskMultiplier}x
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
                <span className={`font-medium ${
                  breakdown.riskScore < 30 ? 'text-green-600' :
                  breakdown.riskScore < 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {breakdown.riskScore}/100
                </span>
              </div>

              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.riskScore}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full ${
                    breakdown.riskScore < 30 ? 'bg-green-500' :
                    breakdown.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>

              <p className="text-sm text-gray-500 mt-2">
                {breakdown.riskMultiplier < 1 
                  ? 'Lower than average risk profile'
                  : breakdown.riskMultiplier < 1.5
                  ? 'Average risk profile'
                  : 'Higher than average risk profile'
                }
              </p>
            </div>
          </Card>

          {/* Next Payment */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Next Payment
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(breakdown.nextPaymentDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button
                onClick={() => onPayment?.('next')}
                className="w-full mt-4"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
            </div>
          </Card>

          {/* Payment History Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Repeat className="w-4 h-4" />
              Payment History
            </span>
            <ChevronRight className={`w-4 h-4 transition-transform ${
              showHistory ? 'rotate-90' : ''
            }`} />
          </Button>
        </div>
      </div>

      {/* Payment History */}
      {showHistory && paymentHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment History
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Export functionality */}}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Method
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr 
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {payment.method}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};