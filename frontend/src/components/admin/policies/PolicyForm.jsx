import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, X, Plus, Trash2, Calendar, DollarSign,
  Users, Shield, FileText, AlertCircle, Clock
} from 'lucide-react';
import { policyService } from '../../../services/policy.service';
import { userService } from '../../../services/user.service';
import { Loader, Toast } from '../../common';
import { Button } from '../../../ui/Button';
import { Input, Select, DatePicker } from '../../../ui/Form';

export const PolicyForm = ({ mode = 'create', policyId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'life',
    name: '',
    description: '',
    coverageAmount: '',
    termLength: 12,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    premiumFrequency: 'monthly',
    totalPremium: '',
    riskMultiplier: 1.0,
    coverage: [
      {
        type: 'life',
        coverageAmount: '',
        deductible: '',
        maxLimit: '',
        description: ''
      }
    ],
    beneficiaries: [],
    documents: [],
    underwriterNotes: '',
    isAutoRenewable: true
  });

  const [errors, setErrors] = useState({});
  const [userSearch, setUserSearch] = useState('');

  const policyTypes = [
    { value: 'life', label: 'Life Insurance' },
    { value: 'health', label: 'Health Insurance' },
    { value: 'auto', label: 'Auto Insurance' },
    { value: 'property', label: 'Property Insurance' },
    { value: 'disability', label: 'Disability Insurance' },
    { value: 'liability', label: 'Liability Insurance' }
  ];

  const premiumFrequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annual', label: 'Semi-Annual' },
    { value: 'annual', label: 'Annual' }
  ];

  const riskLevels = [
    { value: 0.5, label: 'Very Low (0.5x)' },
    { value: 0.8, label: 'Low (0.8x)' },
    { value: 1.0, label: 'Standard (1.0x)' },
    { value: 1.2, label: 'High (1.2x)' },
    { value: 1.5, label: 'Very High (1.5x)' },
    { value: 2.0, label: 'Extreme (2.0x)' }
  ];

  useEffect(() => {
    if (mode === 'edit' && (id || policyId)) {
      fetchPolicy();
    }
    fetchUsers();
  }, [mode, id, policyId]);

  useEffect(() => {
    // Calculate end date based on start date and term length
    if (formData.startDate && formData.termLength) {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setMonth(start.getMonth() + parseInt(formData.termLength));
      setFormData(prev => ({
        ...prev,
        endDate: end.toISOString().split('T')[0]
      }));
    }
  }, [formData.startDate, formData.termLength]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const policy = await policyService.getPolicyById(id || policyId);
      
      setFormData({
        userId: policy.user?._id || policy.userId || '',
        type: policy.type || 'life',
        name: policy.name || '',
        description: policy.description || '',
        coverageAmount: policy.coverageAmount || '',
        termLength: policy.termLength || 12,
        startDate: policy.startDate ? new Date(policy.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: policy.endDate ? new Date(policy.endDate).toISOString().split('T')[0] : '',
        premiumFrequency: policy.premiumFrequency || 'monthly',
        totalPremium: policy.totalPremium || '',
        riskMultiplier: policy.riskMultiplier || 1.0,
        coverage: policy.coverage || [{
          type: 'life',
          coverageAmount: '',
          deductible: '',
          maxLimit: '',
          description: ''
        }],
        beneficiaries: policy.beneficiaries || [],
        documents: policy.documents || [],
        underwriterNotes: policy.underwriterNotes || '',
        isAutoRenewable: policy.isAutoRenewable ?? true
      });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load policy data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers({ limit: 50 });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCoverageChange = (index, field, value) => {
    const newCoverage = [...formData.coverage];
    newCoverage[index] = { ...newCoverage[index], [field]: value };
    setFormData(prev => ({ ...prev, coverage: newCoverage }));
  };

  const addCoverage = () => {
    setFormData(prev => ({
      ...prev,
      coverage: [
        ...prev.coverage,
        {
          type: 'life',
          coverageAmount: '',
          deductible: '',
          maxLimit: '',
          description: ''
        }
      ]
    }));
  };

  const removeCoverage = (index) => {
    if (formData.coverage.length > 1) {
      const newCoverage = [...formData.coverage];
      newCoverage.splice(index, 1);
      setFormData(prev => ({ ...prev, coverage: newCoverage }));
    }
  };

  const addBeneficiary = () => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: [
        ...prev.beneficiaries,
        {
          name: '',
          relationship: '',
          percentage: '',
          ssn: ''
        }
      ]
    }));
  };

  const handleBeneficiaryChange = (index, field, value) => {
    const newBeneficiaries = [...formData.beneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    setFormData(prev => ({ ...prev, beneficiaries: newBeneficiaries }));
  };

  const removeBeneficiary = (index) => {
    const newBeneficiaries = [...formData.beneficiaries];
    newBeneficiaries.splice(index, 1);
    setFormData(prev => ({ ...prev, beneficiaries: newBeneficiaries }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = 'Please select a user';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Policy name is required';
    }

    if (!formData.coverageAmount || parseFloat(formData.coverageAmount) <= 0) {
      newErrors.coverageAmount = 'Valid coverage amount is required';
    }

    if (!formData.totalPremium || parseFloat(formData.totalPremium) <= 0) {
      newErrors.totalPremium = 'Valid premium amount is required';
    }

    // Validate coverage items
    formData.coverage.forEach((coverage, index) => {
      if (!coverage.coverageAmount || parseFloat(coverage.coverageAmount) <= 0) {
        newErrors[`coverage_${index}_amount`] = 'Valid coverage amount is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({ type: 'error', message: 'Please fix the errors in the form' });
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        coverageAmount: parseFloat(formData.coverageAmount),
        totalPremium: parseFloat(formData.totalPremium),
        termLength: parseInt(formData.termLength),
        coverage: formData.coverage.map(cov => ({
          ...cov,
          coverageAmount: parseFloat(cov.coverageAmount) || 0,
          deductible: parseFloat(cov.deductible) || 0,
          maxLimit: parseFloat(cov.maxLimit) || 0
        }))
      };

      if (mode === 'create') {
        await policyService.createPolicy(payload);
        setToast({ type: 'success', message: 'Policy created successfully!' });
        setTimeout(() => navigate('/admin/policies'), 1500);
      } else {
        await policyService.updatePolicy(id || policyId, payload);
        setToast({ type: 'success', message: 'Policy updated successfully!' });
        setTimeout(() => navigate('/admin/policies'), 1500);
      }
    } catch (error) {
      setToast({ type: 'error', message: `Failed to ${mode} policy: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading && mode === 'edit') return <Loader />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Create New Policy' : 'Edit Policy'}
              </h1>
              <p className="text-indigo-100">
                {mode === 'create' 
                  ? 'Create a new insurance policy for a customer'
                  : 'Update policy details and coverage'}
              </p>
            </div>
          </div>
          <Button
            variant="white"
            onClick={() => navigate('/admin/policies')}
          >
            <X size={18} />
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-3">
                <Users className="text-indigo-500" />
                <span>Basic Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer *
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Search customers by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full"
                    />
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredUsers.map(user => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => {
                            handleChange('userId', user._id);
                            setUserSearch('');
                          }}
                          className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                            formData.userId === user._id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                          }`}
                        >
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {user.role} • Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.userId && (
                      <p className="text-red-500 text-sm">{errors.userId}</p>
                    )}
                    {formData.userId && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-green-800">Customer Selected</div>
                            <div className="text-sm text-green-600">
                              {users.find(u => u._id === formData.userId)?.firstName}{' '}
                              {users.find(u => u._id === formData.userId)?.lastName}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleChange('userId', '')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Policy Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type *
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(value) => handleChange('type', value)}
                    options={policyTypes}
                    error={errors.type}
                  />
                </div>

                {/* Policy Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Comprehensive Life Insurance"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    error={errors.name}
                  />
                </div>

                {/* Coverage Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Coverage Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Enter coverage amount"
                      value={formData.coverageAmount}
                      onChange={(e) => handleChange('coverageAmount', e.target.value)}
                      className="pl-10"
                      min="0"
                      step="1000"
                      error={errors.coverageAmount}
                    />
                  </div>
                </div>

                {/* Total Premium */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Premium *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Enter premium amount"
                      value={formData.totalPremium}
                      onChange={(e) => handleChange('totalPremium', e.target.value)}
                      className="pl-10"
                      min="0"
                      step="100"
                      error={errors.totalPremium}
                    />
                  </div>
                </div>

                {/* Term Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Term Length (Months) *
                  </label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={formData.termLength}
                    onChange={(e) => handleChange('termLength', e.target.value)}
                    min="1"
                    max="360"
                  />
                </div>

                {/* Premium Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Frequency *
                  </label>
                  <Select
                    value={formData.premiumFrequency}
                    onChange={(value) => handleChange('premiumFrequency', value)}
                    options={premiumFrequencies}
                  />
                </div>

                {/* Risk Multiplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Multiplier
                  </label>
                  <Select
                    value={formData.riskMultiplier}
                    onChange={(value) => handleChange('riskMultiplier', parseFloat(value))}
                    options={riskLevels}
                  />
                </div>

                {/* Auto Renewal */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAutoRenewable}
                      onChange={(e) => handleChange('isAutoRenewable', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Enable auto-renewal</span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Coverage Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-3">
                  <Shield className="text-indigo-500" />
                  <span>Coverage Details</span>
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCoverage}
                >
                  <Plus size={18} />
                  Add Coverage
                </Button>
              </div>
              
              <div className="space-y-6">
                {formData.coverage.map((coverage, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-800">Coverage #{index + 1}</h3>
                      {formData.coverage.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCoverage(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Coverage Type
                        </label>
                        <Select
                          value={coverage.type}
                          onChange={(value) => handleCoverageChange(index, 'type', value)}
                          options={policyTypes}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Coverage Amount *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={coverage.coverageAmount}
                            onChange={(e) => handleCoverageChange(index, 'coverageAmount', e.target.value)}
                            className="pl-10"
                            min="0"
                            error={errors[`coverage_${index}_amount`]}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deductible
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Enter deductible"
                            value={coverage.deductible}
                            onChange={(e) => handleCoverageChange(index, 'deductible', e.target.value)}
                            className="pl-10"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Limit
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Enter max limit"
                            value={coverage.maxLimit}
                            onChange={(e) => handleCoverageChange(index, 'maxLimit', e.target.value)}
                            className="pl-10"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={coverage.description}
                          onChange={(e) => handleCoverageChange(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Describe this coverage..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Policy Description</h2>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter detailed policy description..."
              />
            </motion.div>
          </div>

          {/* Right Column - Dates & Actions */}
          <div className="space-y-6">
            {/* Dates */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-3">
                <Calendar className="text-indigo-500" />
                <span>Dates</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <DatePicker
                    value={formData.startDate}
                    onChange={(value) => handleChange('startDate', value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <DatePicker
                    value={formData.endDate}
                    onChange={(value) => handleChange('endDate', value)}
                    min={formData.startDate}
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Calculated based on start date and term length
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Beneficiaries */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-3">
                  <Users className="text-indigo-500" />
                  <span>Beneficiaries</span>
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBeneficiary}
                >
                  <Plus size={18} />
                  Add Beneficiary
                </Button>
              </div>
              
              {formData.beneficiaries.length === 0 ? (
                <div className="text-center py-4">
                  <Users className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">No beneficiaries added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Beneficiary #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeBeneficiary(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={beneficiary.name}
                          onChange={(e) => handleBeneficiaryChange(index, 'name', e.target.value)}
                          size="sm"
                        />
                        <Input
                          type="text"
                          placeholder="Relationship"
                          value={beneficiary.relationship}
                          onChange={(e) => handleBeneficiaryChange(index, 'relationship', e.target.value)}
                          size="sm"
                        />
                        <Input
                          type="number"
                          placeholder="Percentage %"
                          value={beneficiary.percentage}
                          onChange={(e) => handleBeneficiaryChange(index, 'percentage', e.target.value)}
                          size="sm"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Underwriter Notes */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-3">
                <AlertCircle className="text-indigo-500" />
                <span>Underwriter Notes</span>
              </h2>
              <textarea
                value={formData.underwriterNotes}
                onChange={(e) => handleChange('underwriterNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter underwriter notes and comments..."
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  <Save size={18} />
                  {mode === 'create' ? 'Create Policy' : 'Update Policy'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/admin/policies')}
                  disabled={loading}
                >
                  <X size={18} />
                  Cancel
                </Button>
                
                {mode === 'edit' && (
                  <Button
                    type="button"
                    variant="danger"
                    fullWidth
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this policy?')) {
                        // Handle delete
                      }
                    }}
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                    Delete Policy
                  </Button>
                )}
              </div>
              
              {/* Summary */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage:</span>
                    <span className="font-medium">
                      {formData.coverageAmount ? `$${parseFloat(formData.coverageAmount).toLocaleString()}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Premium:</span>
                    <span className="font-medium">
                      {formData.totalPremium ? `$${parseFloat(formData.totalPremium).toLocaleString()}` : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-medium">
                      {formData.termLength} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium capitalize">
                      {formData.premiumFrequency}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default PolicyForm;