import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  UserGroupIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import ClaimsTable from '../../../components/admin/claims/ClaimsTable';
import ClaimDetails from '../../../components/admin/claims/ClaimDetails';
import ClaimReview from '../../../components/admin/claims/ClaimReview';
import FraudAnalysis from '../../../components/admin/claims/FraudAnalysis';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';

const AdminClaims = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isFraudAnalysisOpen, setIsFraudAnalysisOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claims, setClaims] = useState([
    {
      id: 1,
      claimNumber: 'CLM-2024-001',
      policyNumber: 'POL-2024-001',
      customer: 'John Doe',
      type: 'Medical',
      amount: '$15,000',
      status: 'approved',
      assignee: 'Robert Johnson',
      date: '2024-01-15',
      documents: 3,
      fraudRisk: 'low'
    },
    {
      id: 2,
      claimNumber: 'CLM-2024-002',
      policyNumber: 'POL-2024-002',
      customer: 'Jane Smith',
      type: 'Accident',
      amount: '$5,000',
      status: 'pending',
      assignee: 'Unassigned',
      date: '2024-01-20',
      documents: 2,
      fraudRisk: 'medium'
    },
    {
      id: 3,
      claimNumber: 'CLM-2024-003',
      policyNumber: 'POL-2024-003',
      customer: 'Robert Johnson',
      type: 'Collision',
      amount: '$3,500',
      status: 'rejected',
      assignee: 'Sarah Williams',
      date: '2024-01-25',
      documents: 4,
      fraudRisk: 'low'
    },
    {
      id: 4,
      claimNumber: 'CLM-2024-004',
      policyNumber: 'POL-2024-004',
      customer: 'Sarah Williams',
      type: 'Property Damage',
      amount: '$12,000',
      status: 'processing',
      assignee: 'Robert Johnson',
      date: '2024-01-30',
      documents: 5,
      fraudRisk: 'high'
    },
    {
      id: 5,
      claimNumber: 'CLM-2024-005',
      policyNumber: 'POL-2024-005',
      customer: 'Michael Brown',
      type: 'Trip Cancellation',
      amount: '$2,500',
      status: 'approved',
      assignee: 'Unassigned',
      date: '2024-02-01',
      documents: 2,
      fraudRisk: 'low'
    },
    {
      id: 6,
      claimNumber: 'CLM-2024-006',
      policyNumber: 'POL-2024-006',
      customer: 'Emily Davis',
      type: 'Disability',
      amount: '$8,000',
      status: 'pending',
      assignee: 'Sarah Williams',
      date: '2024-02-05',
      documents: 3,
      fraudRisk: 'medium'
    }
  ]);

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
    const matchesAssignee = selectedAssignee === 'all' || claim.assignee === selectedAssignee;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim);
    setIsDetailsOpen(true);
  };

  const handleReviewClaim = (claim) => {
    setSelectedClaim(claim);
    setIsReviewOpen(true);
  };

  const handleFraudAnalysis = (claim) => {
    setSelectedClaim(claim);
    setIsFraudAnalysisOpen(true);
  };

  const handleUpdateStatus = (claimId, status) => {
    setClaims(claims.map(claim => 
      claim.id === claimId ? { ...claim, status } : claim
    ));
  };

  const handleAssignClaim = (claimId, assignee) => {
    setClaims(claims.map(claim => 
      claim.id === claimId ? { ...claim, assignee } : claim
    ));
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', icon: ClockIcon, color: 'text-yellow-500' },
    { value: 'processing', label: 'Processing', icon: ClockIcon, color: 'text-blue-500' },
    { value: 'approved', label: 'Approved', icon: CheckCircleIcon, color: 'text-green-500' },
    { value: 'rejected', label: 'Rejected', icon: XCircleIcon, color: 'text-red-500' }
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'Unassigned', label: 'Unassigned' },
    { value: 'Robert Johnson', label: 'Robert Johnson' },
    { value: 'Sarah Williams', label: 'Sarah Williams' },
    { value: 'Jane Smith', label: 'Jane Smith' }
  ];

  const stats = [
    { label: 'Total Claims', value: '342', change: '+12.4%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Review', value: '124', change: '-8.2%', color: 'from-yellow-500 to-orange-500' },
    { label: 'Approved Amount', value: '$2.1M', change: '+15.3%', color: 'from-emerald-500 to-green-500' },
    { label: 'Avg Processing Time', value: '3.2 days', change: '-0.8', color: 'from-purple-500 to-pink-500' }
  ];

  const fraudStats = [
    { level: 'Low Risk', count: 245, percentage: 71.6, color: 'bg-green-500' },
    { level: 'Medium Risk', count: 68, percentage: 19.9, color: 'bg-yellow-500' },
    { level: 'High Risk', count: 29, percentage: 8.5, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Claims Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and process insurance claims
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Export</span>
          </Button>
          <Button
            onClick={() => {}}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            <span>Bulk Actions</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              {index === 0 && <ClipboardDocumentListIcon className="w-6 h-6 text-white" />}
              {index === 1 && <ClockIcon className="w-6 h-6 text-white" />}
              {index === 2 && <CurrencyDollarIcon className="w-6 h-6 text-white" />}
              {index === 3 && <ExclamationTriangleIcon className="w-6 h-6 text-white" />}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {stat.label}
            </div>
            <div className={`inline-flex items-center text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {stat.change.startsWith('+') ? '↗' : '↘'} {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fraud Risk Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Fraud Risk Analysis</h3>
            <p className="text-gray-300">
              Overview of claim fraud risk levels
            </p>
          </div>
          <Button
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
            onClick={() => setIsFraudAnalysisOpen(true)}
          >
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Run Analysis
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fraudStats.map((stat, index) => (
            <div key={stat.level} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">{stat.level}</div>
                <div className="text-2xl font-bold">{stat.count}</div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} rounded-full`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-300">
                <span>{stat.percentage}%</span>
                <span>of total claims</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search claims by number, policy, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-96"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              className="w-48"
              renderOption={(option) => (
                <div className="flex items-center space-x-2">
                  {option.icon && <option.icon className={`w-4 h-4 ${option.color}`} />}
                  <span>{option.label}</span>
                </div>
              )}
            />

            <Select
              value={selectedAssignee}
              onChange={setSelectedAssignee}
              options={assigneeOptions}
              className="w-48"
            />

            <Button variant="outline" className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <ClaimsTable
          claims={filteredClaims}
          onViewDetails={handleViewDetails}
          onReview={handleReviewClaim}
          onFraudAnalysis={handleFraudAnalysis}
          onUpdateStatus={handleUpdateStatus}
          onAssign={handleAssignClaim}
        />
      </motion.div>

      {/* Empty State */}
      {filteredClaims.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No claims found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button onClick={() => { setSearchTerm(''); setSelectedStatus('all'); setSelectedAssignee('all'); }}>
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* Claim Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Claim Details"
        size="xl"
      >
        {selectedClaim && <ClaimDetails claim={selectedClaim} />}
      </Modal>

      {/* Claim Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Review Claim"
        size="lg"
      >
        {selectedClaim && (
          <ClaimReview
            claim={selectedClaim}
            onApprove={() => handleUpdateStatus(selectedClaim.id, 'approved')}
            onReject={() => handleUpdateStatus(selectedClaim.id, 'rejected')}
            onAssign={(assignee) => handleAssignClaim(selectedClaim.id, assignee)}
            onClose={() => setIsReviewOpen(false)}
          />
        )}
      </Modal>

      {/* Fraud Analysis Modal */}
      <Modal
        isOpen={isFraudAnalysisOpen}
        onClose={() => setIsFraudAnalysisOpen(false)}
        title="Fraud Analysis"
        size="xl"
      >
        {selectedClaim && <FraudAnalysis claim={selectedClaim} />}
      </Modal>
    </div>
  );
};

export default AdminClaims;