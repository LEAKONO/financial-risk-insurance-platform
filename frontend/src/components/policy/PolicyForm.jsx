import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, Calendar, User, 
  Building, FileText, Shield,
  DollarSign, Clock, Percent,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { policyService } from '@/services/api'; // Import your API service

const policyTypes = [
  { value: 'life', label: 'Life Insurance' },
  { value: 'health', label: 'Health Insurance' },
  { value: 'property', label: 'Property Insurance' },
  { value: 'auto', label: 'Auto Insurance' },
  { value: 'disability', label: 'Disability Insurance' },
  { value: 'liability', label: 'Liability Insurance' }
];

const termOptions = [
  { value: 1, label: '1 Year' },
  { value: 5, label: '5 Years' },
  { value: 10, label: '10 Years' },
  { value: 15, label: '15 Years' },
  { value: 20, label: '20 Years' },
  { value: 30, label: '30 Years' }
];

const premiumFrequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' }
];

export const PolicyForm = ({ initialData = {}, onSubmit, onCancel, mode = 'create' }) => {
  const navigate = useNavigate();
  const backdropRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    policyType: initialData.policyType || 'life',
    coverageAmount: initialData.coverageAmount || 100000,
    termLength: initialData.termLength || 20,
    premiumFrequency: initialData.premiumFrequency || 'monthly',
    startDate: initialData.startDate || new Date().toISOString().split('T')[0],
    isAutoRenewable: initialData.isAutoRenewable !== false,
    beneficiaries: initialData.beneficiaries || [{ name: '', relationship: '', percentage: 100 }],
    documents: initialData.documents || []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Escape key handler
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && !loading) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [loading]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required';
    }
    
    if (!formData.coverageAmount || formData.coverageAmount < 1000) {
      newErrors.coverageAmount = 'Coverage amount must be at least $1,000';
    }
    
    if (!formData.termLength || formData.termLength < 1) {
      newErrors.termLength = 'Term length is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // Validate beneficiaries percentages sum to 100
    if (formData.beneficiaries && formData.beneficiaries.length > 0) {
      const totalPercentage = formData.beneficiaries.reduce((sum, beneficiary) => {
        return sum + (parseFloat(beneficiary.percentage) || 0);
      }, 0);
      
      if (totalPercentage !== 100) {
        newErrors.beneficiaries = 'Beneficiary percentages must total 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Transform form data to match backend expectations
      const backendFormData = {
        name: formData.name,
        description: formData.description,
        policyType: formData.policyType,
        coverageAmount: parseFloat(formData.coverageAmount),
        termLength: parseInt(formData.termLength),
        premiumFrequency: formData.premiumFrequency,
        startDate: formData.startDate,
        isAutoRenewable: formData.isAutoRenewable,
        // Convert beneficiaries to array of objects
        beneficiaries: formData.beneficiaries.map(b => ({
          name: b.name,
          relationship: b.relationship,
          percentage: parseFloat(b.percentage) || 0
        }))
      };

      console.log('Sending policy data:', backendFormData);

      // If onSubmit callback is provided, use it
      if (onSubmit) {
        await onSubmit(backendFormData);
      } else {
        // Otherwise make direct API call
        const result = await policyService.createPolicy(backendFormData);
        
        if (result.success) {
          console.log('Policy created successfully:', result.data);
          
          // Show success message
          // You could use a toast notification here
          
          // Navigate back to policies dashboard
          navigate('/dashboard/policies');
        } else {
          throw new Error(result.message || 'Failed to create policy');
        }
      }
      
    } catch (error) {
      console.error('Error creating policy:', error);
      setApiError(error.message || 'Failed to create policy. Please try again.');
      
      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dashboard/policies');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current && !loading) {
      handleCancel();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    if (apiError) setApiError('');
  };

  const handleBeneficiaryChange = (index, field, value) => {
    const updatedBeneficiaries = [...formData.beneficiaries];
    updatedBeneficiaries[index] = {
      ...updatedBeneficiaries[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, beneficiaries: updatedBeneficiaries }));
    
    if (errors.beneficiaries) {
      setErrors(prev => ({ ...prev, beneficiaries: null }));
    }
  };

  const addBeneficiary = () => {
    setFormData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { name: '', relationship: '', percentage: 0 }]
    }));
  };

  const removeBeneficiary = (index) => {
    if (formData.beneficiaries.length > 1) {
      const updatedBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, beneficiaries: updatedBeneficiaries }));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs]
    }));
  };

  // Calculate beneficiaries percentage total
  const beneficiariesTotal = formData.beneficiaries.reduce((sum, b) => {
    return sum + (parseFloat(b.percentage) || 0);
  }, 0);

  return (
    <AnimatePresence>
      <motion.div
        ref={backdropRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="policy-form-backdrop fixed inset-0 bg-gray-900/70 dark:bg-gray-900/80 backdrop-blur-sm z-50 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden my-8 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {mode === 'create' ? 'Create New Policy' : 'Edit Policy'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {mode === 'create' ? 'Fill in policy details' : 'Update existing policy'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-20">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 sm:mr-2 inline" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        <span className="hidden sm:inline">Saving...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:mr-2 inline" />
                        <span className="hidden sm:inline">{mode === 'create' ? 'Create' : 'Update'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="p-6">
                {/* API Error Message */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                          Error
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {apiError}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-6"
                >
                  {/* Policy Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Policy Details
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Basic policy information
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Policy Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Policy Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Family Life Insurance"
                          className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                            errors.name 
                              ? 'border-red-300 dark:border-red-700' 
                              : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Policy Type */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Policy Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.policyType}
                          onChange={(e) => handleInputChange('policyType', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          {policyTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Coverage Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Coverage Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={formData.coverageAmount}
                            onChange={(e) => handleInputChange('coverageAmount', e.target.value)}
                            min="1000"
                            step="1000"
                            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border ${
                              errors.coverageAmount 
                                ? 'border-red-300 dark:border-red-700' 
                                : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                          />
                        </div>
                        {errors.coverageAmount ? (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.coverageAmount}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Minimum: $1,000
                          </p>
                        )}
                      </div>

                      {/* Term Length */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Term Length <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.termLength}
                          onChange={(e) => handleInputChange('termLength', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          {termOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border ${
                              errors.startDate 
                                ? 'border-red-300 dark:border-red-700' 
                                : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                          />
                        </div>
                        {errors.startDate && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.startDate}
                          </p>
                        )}
                      </div>

                      {/* Premium Frequency */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Premium Frequency
                        </label>
                        <select
                          value={formData.premiumFrequency}
                          onChange={(e) => handleInputChange('premiumFrequency', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          {premiumFrequencyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe the policy details..."
                          rows={3}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Beneficiaries */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Beneficiaries
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Add policy beneficiaries
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addBeneficiary}
                        className="px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2 inline" />
                        Add
                      </button>
                    </div>

                    {/* Beneficiaries Total Warning */}
                    {beneficiariesTotal !== 100 && formData.beneficiaries.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Beneficiary percentages total {beneficiariesTotal}%. Must total 100%.
                          </span>
                        </div>
                      </div>
                    )}

                    {errors.beneficiaries && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors.beneficiaries}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {formData.beneficiaries.map((beneficiary, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2 space-y-2">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                Name
                              </label>
                              <input
                                type="text"
                                value={beneficiary.name}
                                onChange={(e) => handleBeneficiaryChange(index, 'name', e.target.value)}
                                placeholder="Full name"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                Relationship
                              </label>
                              <select
                                value={beneficiary.relationship}
                                onChange={(e) => handleBeneficiaryChange(index, 'relationship', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                              >
                                <option value="">Select...</option>
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                Percentage
                              </label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <input
                                    type="number"
                                    value={beneficiary.percentage}
                                    onChange={(e) => handleBeneficiaryChange(index, 'percentage', e.target.value)}
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                  />
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Percent className="w-3 h-3 text-gray-400" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeBeneficiary(index)}
                                  disabled={formData.beneficiaries.length === 1}
                                  className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-renewal */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Auto-Renewal
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically renew this policy when it expires
                          </p>
                        </div>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isAutoRenewable}
                          onChange={(e) => handleInputChange('isAutoRenewable', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Error Summary */}
                  {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                            Please fix the following errors:
                          </h4>
                          <ul className="space-y-1">
                            {Object.entries(errors).map(([field, message]) => (
                              <li key={field} className="text-sm text-red-700 dark:text-red-400">
                                • {message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.form>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PolicyForm;