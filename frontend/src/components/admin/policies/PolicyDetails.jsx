import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, User, Calendar, DollarSign,
  Shield, TrendingUp, Clock, AlertCircle,
  Download, Send, Edit, ExternalLink,
  ChevronLeft, CheckCircle, XCircle, Users
} from 'lucide-react';
import { policyService } from '../../../services/policy.service';
import { Loader, Toast } from '../../common';
import { StatusBadge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const data = await policyService.getPolicyById(id);
      setPolicy(data);
      setDocuments(data.documents || []);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load policy details' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await policyService.updatePolicyStatus(id, { status: newStatus });
      setToast({ type: 'success', message: `Policy status updated to ${newStatus}` });
      fetchPolicy();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update policy status' });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <Loader />;
  if (!policy) return <div>Policy not found</div>;

  const daysRemaining = calculateDaysRemaining(policy.endDate);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ChevronLeft size={20} />
          <span>Back to Policies</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Policy Details</h1>
            <p className="text-gray-600">Policy #{policy.policyNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={policy.status} />
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/policies/edit/${id}`)}
            >
              <Edit size={18} />
              Edit Policy
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policy Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem 
                icon={<FileText className="text-blue-500" />}
                label="Policy Type"
                value={policy.type}
                className="capitalize"
              />
              <DetailItem 
                icon={<Calendar className="text-green-500" />}
                label="Start Date"
                value={formatDate(policy.startDate)}
              />
              <DetailItem 
                icon={<Calendar className="text-red-500" />}
                label="End Date"
                value={formatDate(policy.endDate)}
                additional={
                  daysRemaining > 0 && (
                    <span className="text-sm text-gray-500">
                      ({daysRemaining} days remaining)
                    </span>
                  )
                }
              />
              <DetailItem 
                icon={<DollarSign className="text-yellow-500" />}
                label="Total Premium"
                value={formatCurrency(policy.totalPremium)}
              />
              <DetailItem 
                icon={<User className="text-purple-500" />}
                label="Policy Holder"
                value={policy.user?.name}
              />
              <DetailItem 
                icon={<Shield className="text-indigo-500" />}
                label="Coverage Amount"
                value={formatCurrency(policy.coverageAmount)}
              />
              <DetailItem 
                icon={<TrendingUp className="text-emerald-500" />}
                label="Risk Multiplier"
                value={policy.riskMultiplier?.toFixed(2) || '1.00'}
              />
              <DetailItem 
                icon={<Clock className="text-amber-500" />}
                label="Term Length"
                value={`${policy.termLength} months`}
              />
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Policy Description</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {policy.description || 'No description available.'}
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b">
              <nav className="flex space-x-1 px-6">
                {['overview', 'coverage', 'documents', 'payment-history', 'claims'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {activeTab === 'overview' && (
                    <OverviewTab policy={policy} />
                  )}
                  {activeTab === 'coverage' && (
                    <CoverageTab coverage={policy.coverage} />
                  )}
                  {activeTab === 'documents' && (
                    <DocumentsTab documents={documents} />
                  )}
                  {activeTab === 'payment-history' && (
                    <PaymentHistoryTab payments={policy.paymentHistory} />
                  )}
                  {activeTab === 'claims' && (
                    <ClaimsTab claims={policy.claims} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {policy.status === 'active' && (
                <>
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => handleStatusUpdate('renewed')}
                  >
                    <CheckCircle size={18} />
                    Renew Policy
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => handleStatusUpdate('cancelled')}
                  >
                    <XCircle size={18} />
                    Cancel Policy
                  </Button>
                </>
              )}
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/admin/claims/new?policy=${id}`)}
              >
                <AlertCircle size={18} />
                File Claim
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  // Handle document download
                }}
              >
                <Download size={18} />
                Download Documents
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate(`/admin/users/${policy.user?.id}`)}
              >
                <Users size={18} />
                View Customer
              </Button>
            </div>
          </motion.div>

          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Policy Status</h3>
            <div className="space-y-3">
              <StatusItem label="Current Status" value={policy.status} />
              <StatusItem label="Risk Level" value={policy.riskLevel || 'Medium'} />
              <StatusItem label="Underwriter" value={policy.underwriter?.name || 'Unassigned'} />
              <StatusItem label="Last Updated" value={formatDate(policy.updatedAt)} />
              
              {/* Timeline */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-700 mb-3">Status Timeline</h4>
                <div className="space-y-2">
                  <TimelineItem 
                    date={formatDate(policy.createdAt)}
                    status="Created"
                    active
                  />
                  {policy.activatedAt && (
                    <TimelineItem 
                      date={formatDate(policy.activatedAt)}
                      status="Activated"
                    />
                  )}
                  <TimelineItem 
                    date={formatDate(policy.endDate)}
                    status="Expires"
                    future
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <ContactItem 
                label="Policy Holder"
                value={policy.user?.name}
                email={policy.user?.email}
                phone={policy.user?.phone}
              />
              <ContactItem 
                label="Agent"
                value={policy.agent?.name}
                email={policy.agent?.email}
              />
              <ContactItem 
                label="Underwriter"
                value={policy.underwriter?.name}
                email={policy.underwriter?.email}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailItem = ({ icon, label, value, className = '', additional }) => (
  <div className="flex items-center space-x-3">
    <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`font-medium ${className}`}>{value}</div>
      {additional && <div className="mt-1">{additional}</div>}
    </div>
  </div>
);

const StatusItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const ContactItem = ({ label, value, email, phone }) => (
  <div>
    <div className="font-medium text-gray-700">{label}</div>
    <div className="mt-1 space-y-1">
      {value && <div className="text-sm">{value}</div>}
      {email && <div className="text-sm text-gray-500">{email}</div>}
      {phone && <div className="text-sm text-gray-500">{phone}</div>}
    </div>
  </div>
);

const TimelineItem = ({ date, status, active = false, future = false }) => (
  <div className="flex items-start space-x-3">
    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
      active ? 'bg-green-500' : 
      future ? 'bg-blue-500' : 
      'bg-gray-400'
    }`} />
    <div className="flex-1">
      <div className="font-medium text-gray-800">{status}</div>
      <div className="text-sm text-gray-500">{date}</div>
    </div>
  </div>
);

const OverviewTab = ({ policy }) => (
  <div className="space-y-4">
    <h4 className="font-semibold text-gray-800">Policy Overview</h4>
    <p className="text-gray-600">
      This policy was created on {formatDate(policy.createdAt)} and provides coverage 
      for {policy.type} insurance. The policy holder is {policy.user?.name}.
    </p>
    {policy.notes && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-yellow-800 mb-2">
          <AlertCircle size={18} />
          <span className="font-medium">Underwriter Notes</span>
        </div>
        <p className="text-yellow-700">{policy.notes}</p>
      </div>
    )}
  </div>
);

const CoverageTab = ({ coverage = [] }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-4">Coverage Details</h4>
    {coverage.length === 0 ? (
      <p className="text-gray-500">No coverage details available</p>
    ) : (
      <div className="space-y-4">
        {coverage.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Shield className="text-blue-500" />
                <span className="font-semibold capitalize">{item.type}</span>
              </div>
              <span className="font-bold text-lg">
                {formatCurrency(item.amount)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Deductible:</span>
                <span className="font-medium ml-2">{formatCurrency(item.deductible)}</span>
              </div>
              <div>
                <span className="text-gray-500">Limit:</span>
                <span className="font-medium ml-2">{formatCurrency(item.limit)}</span>
              </div>
              {item.description && (
                <div className="col-span-2">
                  <span className="text-gray-500">Description:</span>
                  <p className="mt-1 text-gray-600">{item.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DocumentsTab = ({ documents = [] }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-gray-800">Policy Documents</h4>
      <Button size="sm">
        <Send size={16} />
        Upload Document
      </Button>
    </div>
    {documents.length === 0 ? (
      <div className="text-center py-8">
        <FileText className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-gray-500">No documents uploaded</p>
      </div>
    ) : (
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              <FileText className="text-gray-400" />
              <div>
                <div className="font-medium">{doc.name}</div>
                <div className="text-sm text-gray-500">
                  Uploaded on {formatDate(doc.uploadDate)} • {doc.type}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Eye size={18} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800">
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PaymentHistoryTab = ({ payments = [] }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-4">Payment History</h4>
    {payments.length === 0 ? (
      <p className="text-gray-500">No payment history available</p>
    ) : (
      <div className="space-y-3">
        {payments.map((payment, index) => (
          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Payment #{payment.receiptNumber}</div>
              <div className="text-sm text-gray-500">
                {formatDate(payment.date)} • {payment.method}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{formatCurrency(payment.amount)}</div>
              <div className={`text-sm ${
                payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {payment.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ClaimsTab = ({ claims = [] }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-4">Associated Claims</h4>
    {claims.length === 0 ? (
      <p className="text-gray-500">No claims filed for this policy</p>
    ) : (
      <div className="space-y-3">
        {claims.map((claim, index) => (
          <div key={index} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-blue-500" />
                <div>
                  <div className="font-medium">Claim #{claim.number}</div>
                  <div className="text-sm text-gray-500">
                    Filed on {formatDate(claim.date)}
                  </div>
                </div>
              </div>
              <StatusBadge status={claim.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="font-medium ml-2 capitalize">{claim.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium ml-2">{formatCurrency(claim.amount)}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="font-medium ml-2 capitalize">{claim.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Adjuster:</span>
                <span className="font-medium ml-2">{claim.adjuster || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const AnimatePresence = ({ children }) => <>{children}</>;
const Eye = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

export default PolicyDetails;