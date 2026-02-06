import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import ClaimCard from '../../../components/claims/ClaimCard';
import ClaimForm from '../../../components/claims/ClaimForm';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';
import { claimService } from '../../../services/api';

const DashboardClaims = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // API STATE
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH CLAIMS FROM API
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await claimService.getClaims();
      
      if (response.success) {
        // Check if claims array exists in response
        if (response.data && response.data.claims && Array.isArray(response.data.claims)) {
          const transformedClaims = response.data.claims.map(claim => ({
            id: claim._id,
            claimNumber: claim.claimNumber,
            policyName: claim.policy ? claim.policy.name : 'Unknown Policy',
            amount: claim.claimAmount ? `$${claim.claimAmount}` : '$0',
            status: claim.status,
            date: claim.incidentDate 
              ? new Date(claim.incidentDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            type: claim.claimType,
            description: claim.description,
            documents: claim.documents ? claim.documents.length : 0
          }));
          
          setClaims(transformedClaims);
        } else {
          // No claims in response
          setClaims([]);
        }
      } else {
        setError(response.message || 'Failed to load claims');
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', icon: ClockIcon, color: 'text-yellow-500' },
    { value: 'processing', label: 'Processing', icon: ClockIcon, color: 'text-blue-500' },
    { value: 'approved', label: 'Approved', icon: CheckCircleIcon, color: 'text-green-500' },
    { value: 'rejected', label: 'Rejected', icon: XCircleIcon, color: 'text-red-500' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' };
      case 'pending':
        return { icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900' };
      case 'processing':
        return { icon: ClockIcon, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' };
      case 'rejected':
        return { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900' };
      default:
        return { icon: ExclamationTriangleIcon, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700' };
    }
  };

  // Calculate stats from actual data
  const stats = {
    total: claims.length,
    approved: claims.filter(c => c.status === 'approved').length,
    pending: claims.filter(c => c.status === 'pending').length,
    totalClaimed: claims.reduce((sum, c) => sum + parseFloat(c.amount.replace(/[^0-9.-]+/g, '')), 0)
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading claims...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <Button onClick={fetchClaims}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Claims
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all your insurance claims
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            <span>File New Claim</span>
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
            <ClockIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Claims
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.approved}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Approved Claims
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Pending Review
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <DocumentArrowUpIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ${stats.totalClaimed.toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Claimed
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search claims by number, policy, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-96"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              className="w-48"
              renderOption={(option) => (
                <div className="flex items-center space-x-2">
                  {option.icon && <option.icon className={`w-4 h-4 ${option.color}`} />}
                  <span>{option.label}</span>
                </div>
              )}
            />

            <Button variant="outline" className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map((claim, index) => {
          const status = getStatusIcon(claim.status);
          return (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {claim.claimNumber}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                            <status.icon className="w-4 h-4 mr-1" />
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Policy: {claim.policyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {claim.amount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Claimed Amount
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {claim.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Date Filed</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {claim.date}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Documents</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {claim.documents} files
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {claim.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      disabled={claim.status !== 'pending'}
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400"
                      disabled={claim.status !== 'pending'}
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredClaims.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FunnelIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {claims.length === 0
              ? "You haven't filed any claims yet"
              : "No claims match your search"
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {claims.length === 0
              ? "File a claim when you need to make an insurance claim"
              : "Try adjusting your search or filter"
            }
          </p>
          {claims.length === 0 ? (
            <Button onClick={() => setIsModalOpen(true)}>
              File Your First Claim
            </Button>
          ) : (
            <Button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
              Clear filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Process Info */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-4 lg:mb-0 lg:mr-8">
            <h3 className="text-xl font-bold mb-2">Claim Process Timeline</h3>
            <p className="text-blue-100">
              Typical claim processing takes 5-10 business days
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">1-2 days</div>
              <div className="text-sm text-blue-200">Initial Review</div>
            </div>
            <div className="w-8 h-0.5 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">3-5 days</div>
              <div className="text-sm text-blue-200">Documentation</div>
            </div>
            <div className="w-8 h-0.5 bg-white/30"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">1-3 days</div>
              <div className="text-sm text-blue-200">Approval</div>
            </div>
          </div>
        </div>
      </div>

      {/* New Claim Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File New Claim"
        size="xl"
      >
        <ClaimForm onSuccess={() => {
          setIsModalOpen(false);
          fetchClaims();
        }} />
      </Modal>
    </div>
  );
};

export default DashboardClaims;