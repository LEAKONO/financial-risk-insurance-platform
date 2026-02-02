import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronDown, ChevronUp,
  Eye, Edit, Download, MoreVertical,
  Calendar, DollarSign, User, AlertCircle,
  CheckCircle, XCircle, Clock, TrendingUp,
  Check, FileText, Send, Copy, RefreshCw,
  Ban, Trash2, ArrowUpDown, ArrowDown,
  ArrowUp
} from 'lucide-react';
import { policyService } from '../../../services/policy.service';
import { Loader, Toast, Pagination } from '../../common';
import { StatusBadge } from '../../../ui/Badge';
import { PolicyActions } from './PolicyActions';
import { Button } from '../../../ui/Button';
import './PolicyTable.css';

export const PolicyTable = ({ filters = {}, showFilters = true, onPolicyClick, compact = false }) => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: compact ? 5 : 10,
    total: 0,
    pages: 1
  });
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedPolicies, setSelectedPolicies] = useState(new Set());
  const [bulkActions, setBulkActions] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    active: true,
    pending: true,
    expired: true,
    cancelled: true
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, [pagination.page, sortConfig, filters, search, statusFilters]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getPolicies({
        ...filters,
        search,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction,
        statusFilters: Object.keys(statusFilters).filter(key => statusFilters[key])
      });
      
      setPolicies(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load policies' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) return <ChevronDown className="opacity-30" size={16} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const toggleRowExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const toggleSelectPolicy = (id) => {
    const newSelected = new Set(selectedPolicies);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPolicies(newSelected);
    setBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedPolicies.size === policies.length) {
      setSelectedPolicies(new Set());
      setBulkActions(false);
    } else {
      setSelectedPolicies(new Set(policies.map(p => p.id)));
      setBulkActions(true);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const policyIds = Array.from(selectedPolicies);
      switch (action) {
        case 'export':
          await policyService.exportPolicies(policyIds);
          setToast({ type: 'success', message: `Exported ${policyIds.length} policies successfully` });
          break;
        case 'renew':
          await policyService.bulkRenew(policyIds);
          setToast({ type: 'success', message: `Renewed ${policyIds.length} policies successfully` });
          await fetchPolicies();
          break;
        case 'cancel':
          await policyService.bulkCancel(policyIds);
          setToast({ type: 'success', message: `Cancelled ${policyIds.length} policies successfully` });
          await fetchPolicies();
          break;
        case 'sendReminders':
          await policyService.sendReminders(policyIds);
          setToast({ type: 'success', message: `Reminders sent for ${policyIds.length} policies` });
          break;
        case 'delete':
          const confirmed = window.confirm(`Are you sure you want to delete ${policyIds.length} selected policies?`);
          if (confirmed) {
            await policyService.bulkDelete(policyIds);
            setToast({ type: 'success', message: `Deleted ${policyIds.length} policies successfully` });
            await fetchPolicies();
          }
          break;
      }
      // Clear selection after action
      setSelectedPolicies(new Set());
      setBulkActions(false);
    } catch (error) {
      setToast({ type: 'error', message: `Failed to perform bulk action: ${error.message}` });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'expired':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'cancelled':
        return <XCircle className="text-gray-500" size={16} />;
      default:
        return null;
    }
  };

  const handlePolicyAction = async (action, policy) => {
    try {
      switch (action) {
        case 'view':
          onPolicyClick ? onPolicyClick(policy) : navigate(`/policies/${policy.id}`);
          break;
        case 'edit':
          navigate(`/policies/${policy.id}/edit`);
          break;
        case 'renew':
          await policyService.renewPolicy(policy.id);
          setToast({ type: 'success', message: 'Policy renewed successfully' });
          await fetchPolicies();
          break;
        case 'cancel':
          await policyService.cancelPolicy(policy.id);
          setToast({ type: 'success', message: 'Policy cancelled successfully' });
          await fetchPolicies();
          break;
        case 'download':
          await policyService.downloadPolicyDocument(policy.id);
          setToast({ type: 'success', message: 'Document downloaded successfully' });
          break;
        case 'copy':
          navigator.clipboard.writeText(policy.policyNumber);
          setToast({ type: 'success', message: 'Policy number copied to clipboard' });
          break;
        case 'send':
          await policyService.sendPolicyEmail(policy.id);
          setToast({ type: 'success', message: 'Policy document sent via email' });
          break;
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const getRowClass = (policy) => {
    if (selectedPolicies.has(policy.id)) {
      return 'bg-blue-50 border-l-4 border-blue-500';
    }
    if (expandedRows.has(policy.id)) {
      return 'bg-gray-50';
    }
    return '';
  };

  const renderExpandedContent = (policy) => {
    const daysRemaining = getDaysRemaining(policy.endDate);
    const isExpiringSoon = daysRemaining < 30 && daysRemaining > 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-white border-t"
      >
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Coverage Details</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Coverage Type:</span>
                <span className="text-sm font-medium">{policy.coverageType || 'Comprehensive'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Deductible:</span>
                <span className="text-sm font-medium">{formatCurrency(policy.deductible || 1000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Premium:</span>
                <span className="text-sm font-medium">{formatCurrency(policy.premium)}/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Frequency:</span>
                <span className="text-sm font-medium">{policy.paymentFrequency || 'Annual'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Policy Period</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Start Date:</span>
                <span className="text-sm font-medium">{formatDate(policy.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">End Date:</span>
                <span className="text-sm font-medium">{formatDate(policy.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days Remaining:</span>
                <span className={`text-sm font-medium ${
                  isExpiringSoon ? 'text-red-600' : daysRemaining > 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium">{formatDate(policy.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Quick Actions</h4>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePolicyAction('view', policy)}
                className="justify-start"
              >
                <Eye size={14} className="mr-2" />
                View Details
              </Button>
              {policy.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePolicyAction('edit', policy)}
                  className="justify-start"
                >
                  <Edit size={14} className="mr-2" />
                  Edit Policy
                </Button>
              )}
              {(policy.status === 'active' || policy.status === 'expired') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePolicyAction('renew', policy)}
                  className="justify-start"
                >
                  <RefreshCw size={14} className="mr-2" />
                  Renew Policy
                </Button>
              )}
              {policy.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePolicyAction('download', policy)}
                  className="justify-start"
                >
                  <Download size={14} className="mr-2" />
                  Download Document
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        <th className="py-3 px-4 text-left">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedPolicies.size === policies.length && policies.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
            />
            <span className="ml-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Policy
            </span>
          </div>
        </th>
        <th className="py-3 px-4 text-left">
          <button
            onClick={() => handleSort('status')}
            className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Status
            <SortIcon field="status" />
          </button>
        </th>
        <th className="py-3 px-4 text-left">
          <button
            onClick={() => handleSort('premium')}
            className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Premium
            <SortIcon field="premium" />
          </button>
        </th>
        <th className="py-3 px-4 text-left">
          <button
            onClick={() => handleSort('startDate')}
            className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Period
            <SortIcon field="startDate" />
          </button>
        </th>
        <th className="py-3 px-4 text-left">
          <button
            onClick={() => handleSort('insuredName')}
            className="flex items-center text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Insured
            <SortIcon field="insuredName" />
          </button>
        </th>
        <th className="py-3 px-4 text-left">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Actions
          </span>
        </th>
      </tr>
    </thead>
  );

  const renderTableRow = (policy) => {
    const daysRemaining = getDaysRemaining(policy.endDate);
    const isExpanded = expandedRows.has(policy.id);
    const isSelected = selectedPolicies.has(policy.id);
    const isExpiringSoon = daysRemaining < 30 && daysRemaining > 0;

    return (
      <React.Fragment key={policy.id}>
        <tr className={`border-b hover:bg-gray-50 transition-colors duration-200 ${getRowClass(policy)}`}>
          <td className="py-4 px-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectPolicy(policy.id)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <FileText size={16} className="text-gray-400 mr-2" />
                  <button
                    onClick={() => toggleRowExpand(policy.id)}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {policy.policyNumber}
                    {isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {policy.productType || 'Auto Insurance'}
                </div>
              </div>
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center">
              {getStatusIcon(policy.status)}
              <StatusBadge status={policy.status} className="ml-2" />
              {isExpiringSoon && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full flex items-center">
                  <Clock size={10} className="mr-1" />
                  Expires in {daysRemaining}d
                </span>
              )}
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="text-sm font-medium text-gray-900">
              {formatCurrency(policy.premium)}
            </div>
            <div className="text-xs text-gray-500">
              {policy.paymentFrequency || 'Annual'}
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center text-sm text-gray-900">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <div>
                <div>{formatDate(policy.startDate)}</div>
                <div className="text-xs text-gray-500">to {formatDate(policy.endDate)}</div>
              </div>
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {policy.insuredName}
                </div>
                <div className="text-xs text-gray-500">
                  {policy.email}
                </div>
              </div>
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="flex items-center space-x-2">
              <PolicyActions
                policy={policy}
                onAction={handlePolicyAction}
                disabled={policy.status === 'cancelled'}
              />
              <button
                onClick={() => toggleRowExpand(policy.id)}
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </td>
        </tr>
        
        <AnimatePresence>
          {isExpanded && (
            <tr>
              <td colSpan={6} className="p-0">
                {renderExpandedContent(policy)}
              </td>
            </tr>
          )}
        </AnimatePresence>
      </React.Fragment>
    );
  };

  const renderMobileCard = (policy) => {
    const daysRemaining = getDaysRemaining(policy.endDate);
    const isExpanded = expandedRows.has(policy.id);
    const isSelected = selectedPolicies.has(policy.id);
    const isExpiringSoon = daysRemaining < 30 && daysRemaining > 0;

    return (
      <div key={policy.id} className={`border rounded-lg p-4 mb-3 ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelectPolicy(policy.id)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <FileText size={16} className="text-gray-400 mr-2" />
                <div className="text-sm font-medium text-gray-900">
                  {policy.policyNumber}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {policy.productType || 'Auto Insurance'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <PolicyActions
              policy={policy}
              onAction={handlePolicyAction}
              disabled={policy.status === 'cancelled'}
              compact
            />
            <button
              onClick={() => toggleRowExpand(policy.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div className="flex items-center mt-1">
              {getStatusIcon(policy.status)}
              <StatusBadge status={policy.status} className="ml-1" />
              {isExpiringSoon && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {daysRemaining}d
                </span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">Premium</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {formatCurrency(policy.premium)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">Insured</div>
            <div className="text-sm font-medium text-gray-900 mt-1 truncate">
              {policy.insuredName}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500">End Date</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(policy.endDate)}
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-600">Coverage:</span>
                    <div className="text-sm">{policy.coverageType || 'Comprehensive'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Payment:</span>
                    <div className="text-sm">{policy.paymentFrequency || 'Annual'}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePolicyAction('view', policy)}
                    className="flex-1"
                  >
                    View
                  </Button>
                  {policy.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePolicyAction('edit', policy)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilters({
      active: true,
      pending: true,
      expired: true,
      cancelled: true
    });
    setSortConfig({ field: 'createdAt', direction: 'desc' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && policies.length === 0) {
    return <Loader message="Loading policies..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header with search and filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search policies by number, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {showFilters && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <Filter size={16} className="mr-2" />
                  Status Filter
                  <ChevronDown size={16} className="ml-2" />
                </button>
                
                {showStatusFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Filter by Status</span>
                        <button
                          onClick={handleClearFilters}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Clear all
                        </button>
                      </div>
                      {Object.keys(statusFilters).map(status => (
                        <label key={status} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={statusFilters[status]}
                            onChange={() => setStatusFilters(prev => ({
                              ...prev,
                              [status]: !prev[status]
                            }))}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3 flex items-center">
                            {getStatusIcon(status)}
                            <span className="ml-2 text-sm capitalize">{status}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {bulkActions && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedPolicies.size} selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                    className="flex items-center"
                  >
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('renew')}
                    className="flex items-center"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Renew
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('cancel')}
                    className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Ban size={14} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="p-4">
          {policies.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 opacity-20 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No policies found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            policies.map(renderMobileCard)
          )}
        </div>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {renderTableHeader()}
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="text-gray-500">
                      <FileText size={56} className="mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No policies found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="mt-4"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                policies.map(renderTableRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with pagination */}
      {policies.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> policies
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </div>
  );
};