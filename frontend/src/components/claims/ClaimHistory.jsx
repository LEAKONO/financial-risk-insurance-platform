import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  FileText, DollarSign, Calendar, User,
  ChevronDown, ChevronUp, Search, Filter,
  Download, Eye, MessageSquare, ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';
import { claimService } from '@/services/claim.service';

const statusColors = {
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  'under-review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  'documentation-required': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
};

const typeColors = {
  accident: 'bg-red-500',
  illness: 'bg-blue-500',
  'property-damage': 'bg-orange-500',
  theft: 'bg-purple-500',
  liability: 'bg-yellow-500',
  disability: 'bg-indigo-500',
  death: 'bg-gray-500',
  other: 'bg-gray-500'
};

export const ClaimHistory = ({ userId, isAdmin = false }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClaim, setExpandedClaim] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchClaims();
  }, [filters, pagination.page]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.search && { search: filters.search }),
        ...(isAdmin ? {} : { userId })
      };

      const response = await claimService.getClaims(params);
      setClaims(response.data.claims || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      }));
    } catch (error) {
      showToast('error', 'Failed to load claims');
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDownload = async (claimId) => {
    try {
      await claimService.downloadClaimDocuments(claimId);
      showToast('success', 'Download started successfully');
    } catch (error) {
      showToast('error', 'Failed to download documents');
    }
  };

  const toggleExpand = (claimId) => {
    setExpandedClaim(expandedClaim === claimId ? null : claimId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return Clock;
      case 'under-review': return AlertCircle;
      case 'documentation-required': return FileText;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'paid': return DollarSign;
      case 'closed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getTimelineEvents = (claim) => {
    const events = [
      {
        date: claim.createdAt,
        title: 'Claim Submitted',
        description: 'Initial claim submission',
        status: 'completed',
        icon: FileText
      }
    ];

    if (claim.reviewDate) {
      events.push({
        date: claim.reviewDate,
        title: 'Under Review',
        description: 'Claim assigned for review',
        status: 'completed',
        icon: AlertCircle
      });
    }

    if (claim.documentsRequestedDate) {
      events.push({
        date: claim.documentsRequestedDate,
        title: 'Documents Requested',
        description: 'Additional documents requested',
        status: claim.status === 'documentation-required' ? 'current' : 'completed',
        icon: FileText
      });
    }

    if (claim.approvalDate) {
      events.push({
        date: claim.approvalDate,
        title: claim.status === 'rejected' ? 'Claim Rejected' : 'Claim Approved',
        description: claim.status === 'rejected' 
          ? `Rejected: ${claim.rejectionReason || 'No reason provided'}`
          : `Approved amount: ${formatCurrency(claim.approvedAmount)}`,
        status: 'completed',
        icon: claim.status === 'rejected' ? XCircle : CheckCircle
      });
    }

    if (claim.paymentDate) {
      events.push({
        date: claim.paymentDate,
        title: 'Payment Processed',
        description: `Payment of ${formatCurrency(claim.paidAmount || claim.approvedAmount)} processed`,
        status: claim.status === 'paid' ? 'current' : 'completed',
        icon: DollarSign
      });
    }

    if (claim.closedDate) {
      events.push({
        date: claim.closedDate,
        title: 'Claim Closed',
        description: 'Claim has been closed',
        status: 'completed',
        icon: CheckCircle
      });
    }

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const formatTimeElapsed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Claim History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all your insurance claims
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchClaims}
            disabled={loading}
          >
            <span className="sr-only">Refresh</span>
            Refresh
          </Button>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {/* Navigate to admin dashboard */}}
            >
              Admin Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'under-review', label: 'Under Review' },
                { value: 'documentation-required', label: 'Docs Required' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'paid', label: 'Paid' },
                { value: 'closed', label: 'Closed' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'accident', label: 'Accident' },
                { value: 'illness', label: 'Illness' },
                { value: 'property-damage', label: 'Property Damage' },
                { value: 'theft', label: 'Theft' },
                { value: 'liability', label: 'Liability' },
                { value: 'disability', label: 'Disability' },
                { value: 'death', label: 'Death' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <Select
              value={filters.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' }
              ]}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Claims
            </label>
            <Input
              type="text"
              placeholder="Search by claim number, description, or policy number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={Search}
              className="w-full"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pagination.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {claims.filter(c => c.status === 'approved' || c.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {claims.filter(c => ['submitted', 'under-review', 'documentation-required'].includes(c.status)).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {claims.filter(c => c.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </Card>

      {/* Claims List */}
      <Card className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No claims found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.status !== 'all' || filters.type !== 'all' || filters.search
                ? 'Try changing your filters'
                : 'You haven\'t submitted any claims yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {claims.map((claim) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Claim Summary */}
                  <div
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => toggleExpand(claim.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`${typeColors[claim.type] || 'bg-gray-500'} p-3 rounded-lg`}>
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {claim.type?.replace('-', ' ').toUpperCase()}
                            </h3>
                            <Badge className={statusColors[claim.status]}>
                              {(() => {
                                const Icon = getStatusIcon(claim.status);
                                return <Icon className="w-3 h-3 mr-1" />;
                              })()}
                              {claim.status?.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              #{claim.claimNumber}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Filed {formatRelativeTime(claim.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Claimed</div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(claim.claimedAmount)}
                          </div>
                        </div>
                        
                        {claim.approvedAmount && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(claim.approvedAmount)}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(claim.id);
                          }}
                        >
                          {expandedClaim === claim.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedClaim === claim.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Timeline */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Claim Timeline
                              </h4>
                              <div className="space-y-4">
                                {getTimelineEvents(claim).map((event, index) => (
                                  <div key={index} className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full ${
                                      event.status === 'current' 
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}>
                                      <event.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-medium text-gray-900 dark:text-white">
                                          {event.title}
                                        </h5>
                                        <span className="text-sm text-gray-500">
                                          {formatTimeElapsed(event.date)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {event.description}
                                      </p>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(event.date)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Details & Actions */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Claim Details
                              </h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">Description</div>
                                  <p className="text-gray-900 dark:text-white mt-1">
                                    {claim.description || 'No description provided'}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Incident Date</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {formatDate(claim.incidentDate)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Policy</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {claim.policy?.policyNumber || 'N/A'}
                                    </div>
                                  </div>
                                </div>

                                {claim.documents && claim.documents.length > 0 && (
                                  <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      Documents ({claim.documents.length})
                                    </div>
                                    <div className="space-y-2">
                                      {claim.documents.slice(0, 3).map((doc, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                                        >
                                          <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                              {doc.name}
                                            </span>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(doc.url, '_blank')}
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      {claim.documents.length > 3 && (
                                        <div className="text-center">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            +{claim.documents.length - 3} more documents
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {/* Navigate to claim details */}}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                  
                                  {claim.documents && claim.documents.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(claim.id)}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download All
                                    </Button>
                                  )}

                                  {claim.status === 'documentation-required' && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => {/* Navigate to document upload */}}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Docs
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {claims.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.total}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, page: 1 }))}
            />
          </div>
        )}
      </Card>
    </div>
  );
};