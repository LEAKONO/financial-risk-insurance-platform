import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, TrendingUp,
  TrendingDown, Target, Zap, BarChart3,
  Download, Share2, RefreshCw, Eye,
  Heart, DollarSign, Home, Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { ProgressBar } from '@/components/ui/Progress/ProgressBar';
import { formatCurrency, formatPercentage, formatDate } from '@/utils/formatters';
import { riskService } from '@/services/risk.service';

export const RiskSummary = ({ onImprove, onGetCoverage, onViewDetails }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    loadRiskSummary();
  }, [timeframe]);

  const loadRiskSummary = async () => {
    try {
      setLoading(true);
      const response = await riskService.getRiskAnalysis();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load risk summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return CheckCircle;
      case 'moderate': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'very-high': return AlertTriangle;
      default: return Shield;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-500 text-green-100';
      case 'moderate': return 'bg-yellow-500 text-yellow-100';
      case 'high': return 'bg-orange-500 text-orange-100';
      case 'very-high': return 'bg-red-500 text-red-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getRiskTextColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'very-high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Risk summary not available</p>
        <Button onClick={loadRiskSummary} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload
        </Button>
      </div>
    );
  }

  const riskLevel = summary.profile?.category || 'moderate';
  const RiskIcon = getRiskIcon(riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Risk Profile Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive overview of your risk assessment
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={loadRiskSummary}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Risk Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${getRiskColor(riskLevel)}`}>
                <RiskIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Overall Risk Assessment
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Last updated {formatDate(summary.profile?.lastUpdated)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Risk Score</div>
                <div className={`text-3xl font-bold ${getRiskTextColor(riskLevel)}`}>
                  {summary.profile?.score || 50}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level</div>
                <Badge className={`px-3 py-1 ${getRiskColor(riskLevel)}`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Multiplier</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.profile?.multiplier?.toFixed(2) || 1.00}x
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Profile Status</div>
                <Badge className={`px-3 py-1 ${
                  summary.profile?.completeness 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {summary.profile?.completeness ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {formatPercentage(100 - (summary.profile?.score || 50))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Better than average
            </div>
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(summary.categories || {}).map(([category, data], index) => {
          const icons = {
            health: Heart,
            financial: DollarSign,
            occupation: Briefcase,
            geographic: Home,
            lifestyle: Zap
          };
          
          const Icon = icons[category] || BarChart3;
          const riskLevel = data.riskLevel || 'medium';
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getRiskColor(riskLevel)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {data.count || 0} factors
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
                      <span className={`font-semibold ${getRiskTextColor(riskLevel)}`}>
                        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                      </span>
                    </div>
                    <ProgressBar
                      value={(data.averageMultiplier || 1) * 25}
                      max={100}
                      color={riskLevel === 'low' ? 'green' : riskLevel === 'medium' ? 'yellow' : 'red'}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Multiplier</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {data.averageMultiplier?.toFixed(2) || 1.00}x
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => onViewDetails?.(category)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      View details →
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Risk Factors & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Risk Factors */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Risk Factors
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Factors with highest impact on your premium
                </p>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {summary.recommendations?.length || 0} to improve
              </Badge>
            </div>

            <div className="space-y-4">
              {(summary.factors ? Object.values(summary.factors).flat() : []).slice(0, 5).map((factor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      factor.level === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                      factor.level === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        factor.level === 'high' ? 'text-red-600 dark:text-red-400' :
                        factor.level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {factor.description || factor.factor}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-gray-100 dark:bg-gray-700">
                          {factor.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {factor.multiplier?.toFixed(2)}x impact
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-right ${
                    factor.multiplier > 1 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    <div className="text-xl font-bold">
                      +{((factor.multiplier - 1) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm">premium impact</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={() => onViewDetails?.('factors')}
              className="w-full mt-6"
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Risk Factors
            </Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Improve your risk profile
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onImprove}
                className="w-full justify-start"
                variant="outline"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Improve Risk Score
              </Button>
              <Button
                onClick={onGetCoverage}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Get Insurance Coverage
              </Button>
              <Button
                onClick={() => onViewDetails?.('recommendations')}
                className="w-full justify-start"
                variant="outline"
              >
                <Target className="w-4 h-4 mr-2" />
                View Recommendations
              </Button>
            </div>
          </Card>

          {/* Premium Impact */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Premium Impact
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Current Premium</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(1500)}
                  </span>
                </div>
                <ProgressBar value={summary.profile?.score || 50} max={100} color="blue" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">After Improvement</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(1200)}
                  </span>
                </div>
                <ProgressBar value={(summary.profile?.score || 50) - 20} max={100} color="green" />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Save {formatCurrency(300)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Potential annual savings
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personalized Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Actionable steps to improve your risk profile
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    rec.category === 'health' ? 'bg-red-100 dark:bg-red-900/20' :
                    rec.category === 'financial' ? 'bg-green-100 dark:bg-green-900/20' :
                    rec.category === 'lifestyle' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    'bg-purple-100 dark:bg-purple-900/20'
                  }`}>
                    <Zap className={`w-4 h-4 ${
                      rec.category === 'health' ? 'text-red-600 dark:text-red-400' :
                      rec.category === 'financial' ? 'text-green-600 dark:text-green-400' :
                      rec.category === 'lifestyle' ? 'text-blue-600 dark:text-blue-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div>
                    <Badge className="mb-2 bg-gray-100 dark:bg-gray-700 text-xs">
                      {rec.category}
                    </Badge>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {rec.recommendation}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {rec.impact}
                    </p>
                    <div className="mt-3">
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline & Updates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Profile Timeline
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Historical updates and changes
            </p>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div className="space-y-4">
          {[
            { date: '2024-01-15', action: 'Risk score improved', change: '+5', type: 'improvement' },
            { date: '2024-01-10', action: 'Credit score updated', change: '+20', type: 'financial' },
            { date: '2024-01-05', action: 'Health assessment completed', change: 'New', type: 'health' },
            { date: '2023-12-28', action: 'Occupation information updated', change: 'Updated', type: 'occupation' },
            { date: '2023-12-20', action: 'Initial risk assessment', change: 'Baseline', type: 'baseline' }
          ].map((event, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Date(event.date).getDate()}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {event.action}
                  </span>
                  <Badge className={
                    event.type === 'improvement' ? 'bg-green-100 text-green-800' :
                    event.type === 'financial' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'health' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {event.change}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(event.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};