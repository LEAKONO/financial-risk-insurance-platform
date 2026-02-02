import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, Download, 
  TrendingUp, TrendingDown, Calendar,
  Shield, AlertCircle
} from 'lucide-react';
import { PolicyCard } from './PolicyCard';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { Badge } from '@/components/ui/Badge/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { useToast } from '@/hooks/useToast';
import { policyService } from '@/services/policy.service';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'lapsed', label: 'Lapsed' },
  { value: 'draft', label: 'Draft' }
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'health', label: 'Health Insurance' },
  { value: 'property', label: 'Property Insurance' },
  { value: 'auto', label: 'Auto Insurance' },
  { value: 'disability', label: 'Disability Insurance' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'premium_high', label: 'Premium: High to Low' },
  { value: 'premium_low', label: 'Premium: Low to High' },
  { value: 'coverage_high', label: 'Coverage: High to Low' },
  { value: 'coverage_low', label: 'Coverage: Low to High' }
];

export const PolicyList = ({ onViewPolicy, onCreatePolicy, onEditPolicy }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    sortBy: 'newest',
    page: 1,
    limit: 9
  });
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalCoverage: 0,
    totalPremium: 0
  });
  const { showToast } = useToast();

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getUserPolicies(filters);
      setPolicies(response.data.policies);
      setTotal(response.data.pagination.total);
      
      // Calculate stats
      const stats = response.data.policies.reduce((acc, policy) => {
        acc.total++;
        if (policy.status === 'active') acc.active++;
        if (policy.status === 'expired') acc.expired++;
        acc.totalCoverage += policy.totalCoverage || 0;
        acc.totalPremium += policy.totalPremium || 0;
        return acc;
      }, {
        total: 0,
        active: 0,
        expired: 0,
        totalCoverage: 0,
        totalPremium: 0
      });
      
      setStats(stats);
    } catch (error) {
      showToast('error', 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = () => {
    // Export functionality
    showToast('info', 'Export feature coming soon!');
  };

  const handleRenewPolicy = async (policy) => {
    try {
      const response = await policyService.renewPolicy(policy.id);
      showToast('success', 'Policy renewed successfully!');
      fetchPolicies();
    } catch (error) {
      showToast('error', 'Failed to renew policy');
    }
  };

  const handleCancelPolicy = async (policy) => {
    if (window.confirm('Are you sure you want to cancel this policy?')) {
      try {
        const response = await policyService.cancelPolicy(policy.id);
        showToast('success', 'Policy cancelled successfully!');
        fetchPolicies();
      } catch (error) {
        showToast('error', 'Failed to cancel policy');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Policies</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Shield className="w-8 h-8 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Policies</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Coverage</p>
              <p className="text-2xl font-bold">
                ${(stats.totalCoverage / 1000000).toFixed(1)}M
              </p>
            </div>
            <Shield className="w-8 h-8 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Annual Premium</p>
              <p className="text-2xl font-bold">
                ${(stats.totalPremium / 1000).toFixed(1)}K
              </p>
            </div>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Policies
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track all your insurance policies
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={onCreatePolicy}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Policy
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <Input
              placeholder="Search policies..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={Search}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={statusOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              options={typeOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <Select
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={sortOptions}
            />
          </div>
        </div>
      </Card>

      {/* Policies Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : policies.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No policies found"
          description="You haven't created any insurance policies yet."
          actionText="Create Your First Policy"
          onAction={onCreatePolicy}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {policies.map((policy, index) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onView={onViewPolicy}
                  onEdit={onEditPolicy}
                  onRenew={handleRenewPolicy}
                  onCancel={handleCancelPolicy}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {total > filters.limit && (
            <div className="mt-8">
              <Pagination
                currentPage={filters.page}
                totalPages={Math.ceil(total / filters.limit)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && policies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No policies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {filters.search || filters.status || filters.type
              ? 'No policies match your current filters. Try adjusting your search criteria.'
              : 'Start protecting what matters most. Create your first insurance policy today.'}
          </p>
          <Button onClick={onCreatePolicy}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Policy
          </Button>
        </motion.div>
      )}
    </div>
  );
};