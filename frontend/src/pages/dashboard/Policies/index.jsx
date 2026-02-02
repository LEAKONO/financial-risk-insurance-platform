import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import PolicyCard from '../../../components/policy/PolicyCard';
import PolicyForm from '../../../components/policy/PolicyForm';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';

const DashboardPolicies = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const policies = [
    {
      id: 1,
      name: 'Life Insurance Premium',
      policyNumber: 'POL-2024-001',
      premium: '$450/month',
      status: 'active',
      nextPayment: '2024-02-15',
      coverage: '$500,000',
      type: 'Life',
      startDate: '2023-01-15',
      endDate: '2043-01-15'
    },
    {
      id: 2,
      name: 'Health Insurance Gold',
      policyNumber: 'POL-2024-002',
      premium: '$320/month',
      status: 'active',
      nextPayment: '2024-02-20',
      coverage: '$250,000',
      type: 'Health',
      startDate: '2023-02-01',
      endDate: '2024-02-01'
    },
    {
      id: 3,
      name: 'Auto Insurance Comprehensive',
      policyNumber: 'POL-2024-003',
      premium: '$180/month',
      status: 'pending',
      nextPayment: '2024-02-25',
      coverage: '$100,000',
      type: 'Auto',
      startDate: '2023-03-15',
      endDate: '2024-03-15'
    },
    {
      id: 4,
      name: 'Property Insurance',
      policyNumber: 'POL-2024-004',
      premium: '$220/month',
      status: 'expired',
      nextPayment: 'N/A',
      coverage: '$750,000',
      type: 'Property',
      startDate: '2022-01-01',
      endDate: '2023-12-31'
    },
    {
      id: 5,
      name: 'Travel Insurance',
      policyNumber: 'POL-2024-005',
      premium: '$75/month',
      status: 'cancelled',
      nextPayment: 'N/A',
      coverage: '$50,000',
      type: 'Travel',
      startDate: '2023-06-01',
      endDate: '2024-06-01'
    },
    {
      id: 6,
      name: 'Disability Insurance',
      policyNumber: 'POL-2024-006',
      premium: '$150/month',
      status: 'active',
      nextPayment: '2024-03-01',
      coverage: '$300,000',
      type: 'Disability',
      startDate: '2023-08-01',
      endDate: '2033-08-01'
    }
  ];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'life', label: 'Life' },
    { value: 'health', label: 'Health' },
    { value: 'auto', label: 'Auto' },
    { value: 'property', label: 'Property' },
    { value: 'travel', label: 'Travel' },
    { value: 'disability', label: 'Disability' }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Policies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all your insurance policies in one place
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
            <PlusIcon className="w-5 h-5" />
            <span>New Policy</span>
          </Button>
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
                placeholder="Search policies by name or number..."
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
              className="w-40"
            />

            <Select
              value="all"
              onChange={() => {}}
              options={typeOptions}
              className="w-40"
            />

            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 shadow'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 shadow'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TableCellsIcon className="w-5 h-5" />
              </button>
            </div>

            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Policies Grid/Table */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PolicyCard {...policy} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Policy Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Premium
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Next Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {policy.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {policy.policyNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Coverage: {policy.coverage}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {policy.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                        {policy.premium}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          policy.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : policy.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {policy.nextPayment}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredPolicies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FunnelIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No policies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="text-2xl font-bold mb-2">6</div>
          <div className="text-blue-100">Total Policies</div>
          <div className="text-sm text-blue-200 mt-2">3 active policies</div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white">
          <div className="text-2xl font-bold mb-2">$1,395</div>
          <div className="text-emerald-100">Monthly Premium</div>
          <div className="text-sm text-emerald-200 mt-2">$16,740 annually</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="text-2xl font-bold mb-2">$2.0M</div>
          <div className="text-purple-100">Total Coverage</div>
          <div className="text-sm text-purple-200 mt-2">Across all policies</div>
        </div>
      </div>

      {/* New Policy Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Policy"
        size="lg"
      >
        <PolicyForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default DashboardPolicies;