import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  Eye, Edit, Download, MoreVertical,
  Calendar, DollarSign, User, AlertCircle
} from 'lucide-react';
import { claimService } from "../../../services/api";
import { Loader, Toast, Pagination } from '../../common';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';

export const ClaimsTable = ({ filters = {}, showFilters = true }) => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchClaims();
  }, [pagination.page, sortConfig, filters, search]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await claimService.getClaims({
        ...filters,
        search,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction
      });
      
      setClaims(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load claims' });
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

  const toggleRowExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
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
      day: 'numeric'
    });
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) return <ChevronDown className="opacity-30" size={16} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Search and Filters */}
      {showFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search claims by number, policy, or claimant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <Filter size={18} />
              <span>Filters</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}

      {/* Claims Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                {[
                  { field: 'claimNumber', label: 'Claim #' },
                  { field: 'type', label: 'Type' },
                  { field: 'policy.policyNumber', label: 'Policy #' },
                  { field: 'user.name', label: 'Claimant' },
                  { field: 'claimedAmount', label: 'Amount' },
                  { field: 'incidentDate', label: 'Incident Date' },
                  { field: 'status', label: 'Status' },
                  { field: 'priority', label: 'Priority' },
                  { field: 'actions', label: 'Actions' }
                ].map((column) => (
                  <th
                    key={column.field}
                    className={`py-4 px-6 text-left text-sm font-semibold text-gray-700 ${
                      column.field !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.field !== 'actions' && handleSort(column.field)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.field !== 'actions' && <SortIcon field={column.field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12">
                      <Loader />
                    </td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-3">
                        <AlertCircle className="text-gray-400" size={48} />
                        <p>No claims found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  claims.map((claim, index) => (
                    <React.Fragment key={claim.id || index}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-mono font-semibold text-gray-900">
                            {claim.claimNumber}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {claim.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-700">{claim.policy?.policyNumber}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User size={16} className="text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-medium">{claim.user?.name}</div>
                              <div className="text-sm text-gray-500">{claim.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="text-green-500" size={16} />
                            <span className="font-semibold">{formatCurrency(claim.claimedAmount)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar size={14} />
                            <span>{formatDate(claim.incidentDate)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={claim.status} />
                        </td>
                        <td className="py-4 px-6">
                          <PriorityBadge priority={claim.priority || 'medium'} />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/admin/claims/${claim.id}`)}
                              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => toggleRowExpand(claim.id)}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Row */}
                      <AnimatePresence>
                        {expandedRows.has(claim.id) && (
                          <motion.tr
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50"
                          >
                            <td colSpan={9} className="p-0">
                              <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                      {claim.description}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Quick Actions</h4>
                                    <div className="flex space-x-2">
                                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                                        Approve
                                      </button>
                                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                                        Reject
                                      </button>
                                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                                        Assign
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Documents</h4>
                                    <div className="text-sm text-gray-600">
                                      {claim.documents?.length || 0} documents attached
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Claims"
          value={pagination.total}
          change="+12%"
          color="blue"
        />
        <StatCard
          title="Pending Review"
          value={claims.filter(c => c.status === 'pending').length}
          change="+5%"
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={claims.filter(c => c.status === 'approved').length}
          change="+18%"
          color="green"
        />
        <StatCard
          title="Average Claim"
          value={formatCurrency(
            claims.reduce((sum, claim) => sum + claim.claimedAmount, 0) / claims.length || 0
          )}
          change="+8%"
          color="purple"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
          {change}
        </span>
        <span className="text-gray-500 ml-2">from last month</span>
      </div>
    </motion.div>
  );
};

export default ClaimsTable;