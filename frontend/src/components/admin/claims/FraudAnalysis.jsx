import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, Users, Clock, DollarSign,
  BarChart3, FileText, ExternalLink, Download
} from 'lucide-react';
import { claimService } from "../../../services/api";
import { Loader, Toast } from '../../common';
import { Button } from '@/components/ui/Button';

export const FraudAnalysis = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('indicators');

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await claimService.analyzeFraud(id);
      setAnalysis(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load fraud analysis' });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="text-red-500" />;
      case 'medium': return <AlertTriangle className="text-yellow-500" />;
      case 'low': return <AlertTriangle className="text-green-500" />;
      default: return <AlertTriangle className="text-gray-500" />;
    }
  };

  if (loading) return <Loader />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Fraud Analysis</h1>
              <p className="text-red-100">
                Risk Assessment for Claim #{analysis?.claimNumber || id}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold ${getRiskColor(analysis?.riskLevel)}`}>
            {analysis?.riskLevel || 'Unknown'} Risk
          </div>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <RiskMetric
          title="Overall Risk"
          value={analysis?.riskLevel || 'Unknown'}
          icon={<Shield className="text-red-500" />}
          type="risk"
        />
        <RiskMetric
          title="Indicators Found"
          value={analysis?.indicators?.length || 0}
          icon={<AlertTriangle className="text-yellow-500" />}
          type="count"
        />
        <RiskMetric
          title="High Severity"
          value={analysis?.indicators?.filter(i => i.severity === 'high').length || 0}
          icon={<TrendingUp className="text-red-500" />}
          type="warning"
        />
        <RiskMetric
          title="Confidence Score"
          value={`${analysis?.confidenceScore || 0}%`}
          icon={<BarChart3 className="text-blue-500" />}
          type="score"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="border-b">
              <nav className="flex space-x-1 px-6">
                {['indicators', 'patterns', 'history', 'recommendations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'indicators' && (
                <IndicatorsTab indicators={analysis?.indicators} />
              )}
              {activeTab === 'patterns' && (
                <PatternsTab patterns={analysis?.patterns} />
              )}
              {activeTab === 'history' && (
                <HistoryTab history={analysis?.claimHistory} />
              )}
              {activeTab === 'recommendations' && (
                <RecommendationsTab recommendations={analysis?.recommendations} />
              )}
            </div>
          </div>

          {/* Analysis Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Summary</h3>
            <p className="text-gray-600">
              {analysis?.summary || 'No analysis summary available.'}
            </p>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button variant="danger" fullWidth>
                <AlertTriangle size={18} />
                Flag as Suspicious
              </Button>
              <Button variant="warning" fullWidth>
                <Clock size={18} />
                Request Investigation
              </Button>
              <Button variant="primary" fullWidth>
                <FileText size={18} />
                Generate Report
              </Button>
              <Button variant="outline" fullWidth>
                <Download size={18} />
                Export Analysis
              </Button>
            </div>
          </motion.div>

          {/* Similar Claims */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Similar Claims</h3>
            <div className="space-y-3">
              {analysis?.similarClaims?.map((claim, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Claim #{claim.number}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(claim.risk)}`}>
                      {claim.risk}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {claim.type} • {claim.date} • ${claim.amount}
                  </div>
                </div>
              ))}
              {(!analysis?.similarClaims || analysis.similarClaims.length === 0) && (
                <p className="text-gray-500 text-center py-4">No similar claims found</p>
              )}
            </div>
          </motion.div>

          {/* Confidence Metrics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Confidence Metrics</h3>
            <div className="space-y-4">
              <ConfidenceMetric
                label="Pattern Match"
                value={analysis?.confidenceMetrics?.patternMatch || 0}
              />
              <ConfidenceMetric
                label="Historical Consistency"
                value={analysis?.confidenceMetrics?.historicalConsistency || 0}
              />
              <ConfidenceMetric
                label="Document Verification"
                value={analysis?.confidenceMetrics?.documentVerification || 0}
              />
              <ConfidenceMetric
                label="Behavioral Analysis"
                value={analysis?.confidenceMetrics?.behavioralAnalysis || 0}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const RiskMetric = ({ title, value, icon, type }) => {
  const getValueColor = () => {
    if (type === 'risk') {
      if (value === 'High') return 'text-red-600';
      if (value === 'Medium') return 'text-yellow-600';
      return 'text-green-600';
    }
    if (type === 'warning' && parseInt(value) > 0) return 'text-red-600';
    if (type === 'score' && parseInt(value) > 80) return 'text-green-600';
    if (type === 'score' && parseInt(value) > 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${getValueColor()}`}>
            {value}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

const IndicatorsTab = ({ indicators = [] }) => (
  <div className="space-y-4">
    <h4 className="font-semibold text-gray-800">Fraud Indicators</h4>
    {indicators.length === 0 ? (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
        <p className="text-gray-500">No fraud indicators detected</p>
      </div>
    ) : (
      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-red-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(indicator.severity)}
                <span className="font-medium">{indicator.indicator}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                indicator.severity === 'high' ? 'bg-red-100 text-red-800' :
                indicator.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {indicator.severity} severity
              </span>
            </div>
            <p className="text-gray-600 text-sm">{indicator.description}</p>
            {indicator.evidence && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Evidence: {indicator.evidence}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const PatternsTab = ({ patterns = [] }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-4">Suspicious Patterns</h4>
    {patterns.length === 0 ? (
      <p className="text-gray-500">No suspicious patterns detected</p>
    ) : (
      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="text-red-500" />
              <span className="font-medium">{pattern.name}</span>
            </div>
            <p className="text-sm text-gray-600">{pattern.description}</p>
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
              <span>Occurrences: {pattern.occurrences}</span>
              <span>Confidence: {pattern.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const HistoryTab = ({ history = [] }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-4">Claimant History</h4>
    {history.length === 0 ? (
      <p className="text-gray-500">No historical data available</p>
    ) : (
      <div className="space-y-3">
        {history.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Claim #{item.number}</div>
              <div className="text-sm text-gray-500">
                {item.date} • {item.status}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${item.amount}</div>
              <div className={`text-xs ${item.flagged ? 'text-red-600' : 'text-green-600'}`}>
                {item.flagged ? 'Flagged' : 'Clean'}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const RecommendationsTab = ({ recommendations = [] }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-4">Recommendations</h4>
    {recommendations.length === 0 ? (
      <p className="text-gray-500">No recommendations available</p>
    ) : (
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="text-blue-500 mt-1" size={18} />
            <div>
              <div className="font-medium">{rec.action}</div>
              <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Priority: {rec.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ConfidenceMetric = ({ label, value }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-2 rounded-full ${
            percentage >= 80 ? 'bg-green-500' :
            percentage >= 60 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
        />
      </div>
    </div>
  );
};

export default FraudAnalysis;