import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import PolicyTable from '../../../components/admin/policies/PolicyTable';
import PolicyDetails from '../../../components/admin/policies/PolicyDetails';
import PolicyForm from '../../../components/admin/policies/PolicyForm';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';

const AdminPolicies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([
    {
      id: 1,
      policyNumber: 'POL-2024-001',
      name: 'Life Insurance Premium',
      customer: 'John Doe',
      premium: '$450/month',
      coverage: '$500,000',
      type: 'Life',
      status: 'active',
      startDate: '2023-01-15',
      endDate: '2043-01-15',
      claims: 2,
      riskScore: 65
    },
    {
      id: 2,
      policyNumber: 'POL-2024-002',
      name: 'Health Insurance Gold',
      customer: 'Jane Smith',
      premium: '$320/month',
      coverage: '$250,000',
      type: 'Health',
      status: 'active',
      startDate: '2023-02-01',
      endDate: '2024-02-01',
      claims: 1,
      riskScore: 58
    },
    {
      id: 3,
      policyNumber: 'POL-2024-003',
      name: 'Auto Insurance Comprehensive',
      customer: 'Robert Johnson',
      premium: '$180/month',
      coverage: '$100,000',
      type: 'Auto',
      status: 'pending',
      startDate: '2023-03-15',
      endDate: '2024-03-15',
      claims: 0,
      riskScore: 72
    },
    {
      id: 4,
      policyNumber: 'POL-2024-004',
      name: 'Property Insurance',
      customer: 'Sarah Williams',
      premium: '$220/month',
      coverage: '$750,000',
      type: 'Property',
      status: 'expired',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      claims: 3,
      riskScore: 45
    },
    {
      id: 5,
      policyNumber: 'POL-2024-005',
      name: 'Travel Insurance',
      customer: 'Michael Brown',
      premium: '$75/month',
      coverage: '$50,000',
      type: 'Travel',
      status: 'cancelled',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      claims: 1,
      riskScore: 38
    },
    {
      id: 6,
      policyNumber: 'POL-2024-006',
      name: 'Disability Insurance',
      customer: 'Emily Davis',
      premium: '$150/month',
      coverage: '$300,000',
      type: 'Disability',
      status: 'active',
      startDate: '2023-08-01',
      endDate: '2033-08-01',
      claims: 0,
      riskScore: 62
    }
  ]);

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || policy.status === selectedStatus;
    const matchesType = selectedType === 'all' || policy.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (policy) => {
    setSelectedPolicy(policy);
    setIsDetailsOpen(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleDeletePolicy = (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(policy => policy.id !== policyId));
    }
  };

  const handleAddPolicy = (policyData) => {
    const newPolicy = {
      id: policies.length + 1,
      policyNumber: `POL-${new Date().getFullYear()}-${String(policies.length + 1).padStart(3, '0')}`,
      ...policyData,
      claims: 0,
      riskScore: Math.floor(Math.random() * 40) + 30 // Random score 30-70
    };
    setPolicies([...policies, newPolicy]);
    setIsFormOpen(false);
  };

  const handleUpdatePolicy = (updatedData) => {
    setPolicies(policies.map(policy => 
      policy.id === selectedPolicy.id ? { ...policy, ...updatedData } : policy
    ));
    setIsFormOpen(false);
    setSelectedPolicy(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'lapsed', label: 'Lapsed' }
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

  const stats = [
    { label: 'Total Policies', value: '15,234', change: '+8.2%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Policies', value: '12,847', change: '+5.7%', color: 'from-emerald-500 to-green-500' },
    { label: 'Monthly Revenue', value: '$2.8M', change: '+18.7%', color: 'from-purple-500 to-pink-500' },
    { label: 'Avg Risk Score', value: '62', change: '-2.1%', color: 'from-orange-500 to-yellow-500' }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Policy Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all insurance policies
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
            onClick={() => { setSelectedPolicy(null); setIsFormOpen(true); }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Policy</span>
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
              {index === 0 && <DocumentTextIcon className="w-6 h-6 text-white" />}
              {index === 1 && <ShieldCheckIcon className="w-6 h-6 text-white" />}
              {index === 2 && <CurrencyDollarIcon className="w-6 h-6 text-white" />}
              {index === 3 && <ChartBarIcon className="w-6 h-6 text-white" />}
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

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search policies by number, name, or customer..."
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
              className="w-40"
            />

            <Select
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
              className="w-40"
            />

            <Button variant="outline" className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <PolicyTable
          policies={filteredPolicies}
          onViewDetails={handleViewDetails}
          onEdit={handleEditPolicy}
          onDelete={handleDeletePolicy}
        />
      </motion.div>

      {/* Empty State */}
      {filteredPolicies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No policies found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button onClick={() => { setSearchTerm(''); setSelectedStatus('all'); setSelectedType('all'); }}>
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* Policy Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Policy Details"
        size="xl"
      >
        {selectedPolicy && <PolicyDetails policy={selectedPolicy} />}
      </Modal>

      {/* Policy Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedPolicy(null); }}
        title={selectedPolicy ? 'Edit Policy' : 'Create New Policy'}
        size="xl"
      >
        <PolicyForm
          policy={selectedPolicy}
          onSubmit={selectedPolicy ? handleUpdatePolicy : handleAddPolicy}
          onCancel={() => { setIsFormOpen(false); setSelectedPolicy(null); }}
        />
      </Modal>
    </div>
  );
};

export default AdminPolicies;