import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Save, X, Upload, Calendar, FileText,
  AlertCircle, DollarSign, MessageSquare,
  Shield, CheckCircle, Loader2, Heart,
  Home, User, AlertTriangle, Eye
} from 'lucide-react';

const claimTypes = [
  { value: 'accident', label: 'Accident', icon: AlertCircle },
  { value: 'illness', label: 'Illness', icon: Heart },
  { value: 'property-damage', label: 'Property Damage', icon: Home },
  { value: 'theft', label: 'Theft', icon: Shield },
  { value: 'liability', label: 'Liability', icon: AlertTriangle },
  { value: 'disability', label: 'Disability', icon: User },
  { value: 'death', label: 'Death', icon: AlertCircle },
  { value: 'other', label: 'Other', icon: FileText }
];

export const ClaimForm = ({ initialData = {}, onSubmit, onCancel, policies = [], mode = 'create' }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    policy: initialData.policy?.id || initialData.policy || '',
    type: initialData.type || 'accident',
    description: initialData.description || '',
    incidentDate: initialData.incidentDate || new Date().toISOString().split('T')[0],
    claimedAmount: initialData.claimedAmount || '',
    documents: initialData.documents || [],
    priority: initialData.priority || 'normal',
    contactInfo: initialData.contactInfo || '',
    notes: initialData.notes || ''
  });

  const [availablePolicies, setAvailablePolicies] = useState(policies);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    if (formData.policy) {
      const policy = availablePolicies.find(p => p.id === formData.policy);
      setSelectedPolicy(policy);
      if (policy && !formData.claimedAmount) {
        const maxCoverage = policy.coverage?.reduce((sum, cov) => sum + cov.coverageAmount, 0) || policy.totalCoverage || 0;
        if (maxCoverage > 0) {
          setFormData(prev => ({
            ...prev,
            claimedAmount: Math.min(maxCoverage, 10000)
          }));
        }
      }
    }
  }, [formData.policy, availablePolicies]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.policy) {
      newErrors.policy = 'Please select a policy';
    }
    
    if (!formData.type) {
      newErrors.type = 'Claim type is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.incidentDate) {
      newErrors.incidentDate = 'Incident date is required';
    } else {
      const incidentDate = new Date(formData.incidentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (incidentDate > today) {
        newErrors.incidentDate = 'Incident date cannot be in the future';
      }
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (incidentDate < oneYearAgo) {
        newErrors.incidentDate = 'Incident date cannot be more than 1 year ago';
      }
    }
    
    if (!formData.claimedAmount || formData.claimedAmount <= 0) {
      newErrors.claimedAmount = 'Claim amount must be greater than 0';
    } else if (selectedPolicy) {
      const maxCoverage = selectedPolicy.totalCoverage || 0;
      if (parseFloat(formData.claimedAmount) > maxCoverage) {
        newErrors.claimedAmount = `Claim amount cannot exceed policy coverage of $${maxCoverage.toLocaleString()}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const claimData = {...formData, claimedAmount: parseFloat(formData.claimedAmount)};
      
      // If onSubmit callback is provided, use it
      if (onSubmit) {
        await onSubmit(claimData);
      }
      
      // Navigate back to dashboard after successful submission
      navigate('/dashboard/claims');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // If onCancel callback is provided, use it
    if (onCancel) {
      onCancel();
    } else {
      // Otherwise navigate back to claims dashboard
      navigate('/dashboard/claims');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file,
      uploadedAt: new Date().toISOString()
    }));
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const calculateRemainingCoverage = () => {
    if (!selectedPolicy || !formData.claimedAmount) return selectedPolicy?.totalCoverage || 0;
    return selectedPolicy.totalCoverage - parseFloat(formData.claimedAmount);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-hidden flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' ? 'Submit New Claim' : 'Edit Claim'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'create' 
                    ? 'Fill in the details below to submit your insurance claim' 
                    : 'Update your claim information below'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <X className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">{mode === 'create' ? 'Submitting...' : 'Updating...'}</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:mr-2 inline" />
                    <span className="hidden sm:inline">{mode === 'create' ? 'Submit' : 'Update'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Policy Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Policy Information
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Policy <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.policy}
                    onChange={(e) => handleInputChange('policy', e.target.value)}
                    disabled={availablePolicies.length === 0}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                      errors.policy 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">Choose an active policy</option>
                    {availablePolicies.map(policy => (
                      <option key={policy.id} value={policy.id}>
                        {policy.policyNumber} - {policy.name} (Coverage: ${policy.totalCoverage?.toLocaleString() || '0'})
                      </option>
                    ))}
                  </select>
                  {errors.policy && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.policy}
                    </p>
                  )}
                  {availablePolicies.length === 0 && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No active policies found. You need an active policy to file a claim.
                    </p>
                  )}
                </div>

                {selectedPolicy && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {selectedPolicy.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Policy #{selectedPolicy.policyNumber}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Coverage</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ${selectedPolicy.totalCoverage?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Annual Premium</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ${selectedPolicy.totalPremium?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Valid Until</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedPolicy.endDate ? new Date(selectedPolicy.endDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Previous Claims</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {selectedPolicy.totalClaims || 0}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Claim Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Claim Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Claim Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Claim Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                      errors.type 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  >
                    {claimTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.type}
                    </p>
                  )}
                </div>

                {/* Incident Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Incident Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border ${
                        errors.incidentDate 
                          ? 'border-red-300 dark:border-red-700' 
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    />
                  </div>
                  {errors.incidentDate && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.incidentDate}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please provide a detailed description of the incident, including what happened, when, where, and any other relevant information..."
                    rows={4}
                    maxLength={2000}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                      errors.description 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none`}
                  />
                  <div className="flex justify-between">
                    {errors.description ? (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Be as detailed as possible
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.description.length}/2000
                    </p>
                  </div>
                </div>

                {/* Claim Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Claim Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.claimedAmount}
                      onChange={(e) => handleInputChange('claimedAmount', e.target.value)}
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      disabled={!selectedPolicy}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border ${
                        errors.claimedAmount 
                          ? 'border-red-300 dark:border-red-700' 
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  </div>
                  {errors.claimedAmount ? (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.claimedAmount}
                    </p>
                  ) : selectedPolicy && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Available Coverage:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${selectedPolicy.totalCoverage?.toLocaleString() || '0'}
                        </span>
                      </div>
                      {formData.claimedAmount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                          <span className={`font-semibold ${
                            calculateRemainingCoverage() < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            ${calculateRemainingCoverage().toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Claim Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.priority === 'urgent' ? 'Life-threatening or time-critical' :
                     formData.priority === 'high' ? 'Requires immediate attention' :
                     formData.priority === 'low' ? 'Minor incidents with no urgency' :
                     'Standard processing timeline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Supporting Documents
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload photos, reports, receipts, or other documents
                  </p>
                </div>
                
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                  {formData.documents.length} uploaded
                </span>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="claim-file-upload"
                />
                <label
                  htmlFor="claim-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, JPG, PNG (max 10MB each)
                  </span>
                </label>
              </div>

              {formData.documents.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Uploaded Documents
                  </h3>
                  
                  <div className="space-y-3">
                    {formData.documents.map((doc, index) => {
                      const Icon = doc.type?.startsWith('image/') ? Upload : FileText;
                      
                      return (
                        <div
                          key={doc.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {doc.name}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <span>{formatFileSize(doc.size)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Documents */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Recommended Documents
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Police reports (for theft/accident claims)</li>
                      <li>• Medical reports (for illness/injury claims)</li>
                      <li>• Repair estimates or invoices</li>
                      <li>• Photos of damage or incident scene</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Additional Information
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Information for Investigation
                  </label>
                  <textarea
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    placeholder="Provide contact information for any witnesses, medical professionals, or other parties involved..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Include names, phone numbers, email addresses
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Special Instructions or Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information that might help with the claim investigation..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Optional information for the claims adjuster
                  </p>
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                      Please fix the following errors:
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submission Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {mode === 'create' ? 'Ready to Submit' : 'Ready to Update'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {mode === 'create' 
                      ? 'Review your claim information before submission. You will receive a confirmation email and claim number.'
                      : 'Review your changes before updating.'}
                  </p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Review Time:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formData.priority === 'urgent' ? '24-48 hrs' :
                         formData.priority === 'high' ? '3-5 days' : '7-10 days'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Documents:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formData.documents.length > 0 ? 'Uploaded ✓' : 'None'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Coverage:</div>
                      <div className={`font-medium ${
                        calculateRemainingCoverage() >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {calculateRemainingCoverage() >= 0 ? 'Within limits ✓' : 'Exceeds!'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">Contact:</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formData.contactInfo ? 'Provided ✓' : 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;