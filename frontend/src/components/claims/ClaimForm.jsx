import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, X, Upload, Calendar, FileText,
  AlertCircle, DollarSign, MessageSquare,
  Shield, CheckCircle, Loader2, Heart,
  Home, User, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { TextArea } from '@/components/ui/Form/TextArea';
import { DatePicker } from '@/components/ui/Form/DatePicker';
import { FileUpload } from '@/components/ui/Form/FileUpload';
import { Badge } from '@/components/ui/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { claimService } from '@/services/claim.service';
import { policyService } from '@/services/policy.service';

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
  const { showToast } = useToast();

  useEffect(() => {
    if (policies.length === 0) {
      fetchAvailablePolicies();
    }
  }, []);

  useEffect(() => {
    if (formData.policy) {
      const policy = availablePolicies.find(p => p.id === formData.policy);
      setSelectedPolicy(policy);
      if (policy) {
        // Auto-fill suggested claim amount based on coverage
        const maxCoverage = policy.coverage?.reduce((sum, cov) => sum + cov.coverageAmount, 0) || 0;
        if (!formData.claimedAmount && maxCoverage > 0) {
          setFormData(prev => ({
            ...prev,
            claimedAmount: Math.min(maxCoverage, 10000) // Default to lower of max or 10k
          }));
        }
      }
    }
  }, [formData.policy, availablePolicies]);

  const fetchAvailablePolicies = async () => {
    try {
      const response = await policyService.getUserPolicies({ status: 'active' });
      setAvailablePolicies(response.data.policies || []);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      showToast('error', 'Failed to load active policies');
    }
  };

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
      const maxCoverage = selectedPolicy.coverage?.reduce((sum, cov) => sum + cov.coverageAmount, 0) || 0;
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
      showToast('error', 'Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const claimData = {
        ...formData,
        claimedAmount: parseFloat(formData.claimedAmount)
      };

      let response;
      if (mode === 'create') {
        response = await claimService.createClaim(claimData);
        showToast('success', 'Claim submitted successfully!');
      } else {
        response = await claimService.updateClaim(initialData.id, claimData);
        showToast('success', 'Claim updated successfully!');
      }
      
      onSubmit?.(response.data);
    } catch (error) {
      showToast('error', error.message || `Failed to ${mode === 'create' ? 'submit' : 'update'} claim`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDocumentUpload = (files) => {
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
    
    showToast('success', `Added ${files.length} document${files.length > 1 ? 's' : ''}`);
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
    showToast('info', 'Document removed');
  };

  const getPolicyOptions = () => {
    return availablePolicies.map(policy => ({
      value: policy.id,
      label: `${policy.policyNumber} - ${policy.name} (Coverage: $${policy.totalCoverage?.toLocaleString() || '0'})`
    }));
  };

  const calculateRemainingCoverage = () => {
    if (!selectedPolicy || !formData.claimedAmount) return selectedPolicy?.totalCoverage || 0;
    return selectedPolicy.totalCoverage - parseFloat(formData.claimedAmount);
  };

  const getPolicyCoverageTypes = () => {
    if (!selectedPolicy?.coverage) return [];
    return selectedPolicy.coverage.map(cov => ({
      type: cov.type?.replace('-', ' ').toUpperCase() || 'Unknown',
      amount: cov.coverageAmount,
      used: cov.usedAmount || 0,
      remaining: cov.coverageAmount - (cov.usedAmount || 0)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Submit New Claim' : 'Edit Claim'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Fill in the details below to submit your insurance claim' 
              : 'Update your claim information below'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Submitting...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Submit Claim' : 'Update Claim'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Policy Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Policy Information
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Policy *
            </label>
            <Select
              value={formData.policy}
              onChange={(value) => handleInputChange('policy', value)}
              options={getPolicyOptions()}
              placeholder="Choose an active policy"
              error={errors.policy}
              disabled={availablePolicies.length === 0}
            />
            {availablePolicies.length === 0 && (
              <p className="text-sm text-yellow-600 mt-2">
                No active policies found. You need an active policy to file a claim.
              </p>
            )}
          </div>

          {selectedPolicy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-3">
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
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  Active
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
                    {new Date(selectedPolicy.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Previous Claims</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedPolicy.totalClaims || 0}
                  </div>
                </div>
              </div>

              {selectedPolicy.coverage && selectedPolicy.coverage.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coverage Breakdown:</div>
                  <div className="space-y-2">
                    {getPolicyCoverageTypes().map((coverage, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {coverage.type}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${coverage.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${(coverage.used / coverage.amount) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Used: ${coverage.used.toLocaleString()}</span>
                          <span>Remaining: ${coverage.remaining.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>

      {/* Claim Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Claim Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Claim Type *
            </label>
            <Select
              value={formData.type}
              onChange={(value) => handleInputChange('type', value)}
              options={claimTypes.map(type => ({
                value: type.value,
                label: type.label,
                icon: type.icon
              }))}
              error={errors.type}
              renderOption={(option) => (
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Incident Date *
            </label>
            <DatePicker
              value={formData.incidentDate}
              onChange={(date) => handleInputChange('incidentDate', date)}
              error={errors.incidentDate}
              maxDate={new Date().toISOString().split('T')[0]}
              minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide a detailed description of the incident, including what happened, when, where, and any other relevant information..."
              rows={4}
              error={errors.description}
              maxLength={2000}
            />
            <div className="flex justify-between mt-1">
              <p className="text-sm text-gray-500">
                Be as detailed as possible. Include dates, times, locations, and any witnesses.
              </p>
              <p className="text-sm text-gray-500">
                {formData.description.length}/2000 characters
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Claim Amount ($) *
            </label>
            <Input
              type="number"
              value={formData.claimedAmount}
              onChange={(e) => handleInputChange('claimedAmount', e.target.value)}
              min="1"
              step="0.01"
              placeholder="0.00"
              error={errors.claimedAmount}
              disabled={!selectedPolicy}
              prefix={<DollarSign className="w-4 h-4 text-gray-400" />}
            />
            {selectedPolicy && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Available Coverage:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${selectedPolicy.totalCoverage?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining after claim:</span>
                  <span className={`font-semibold ${
                    calculateRemainingCoverage() < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    ${calculateRemainingCoverage().toLocaleString()}
                  </span>
                </div>
                {calculateRemainingCoverage() < 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Warning: Claim amount exceeds available coverage
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Claim Priority
            </label>
            <Select
              value={formData.priority}
              onChange={(value) => handleInputChange('priority', value)}
              options={[
                { value: 'low', label: 'Low Priority', color: 'gray' },
                { value: 'normal', label: 'Normal Priority', color: 'blue' },
                { value: 'high', label: 'High Priority', color: 'orange' },
                { value: 'urgent', label: 'Urgent Priority', color: 'red' }
              ]}
              renderOption={(option) => (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${option.color}-500`}></div>
                  {option.label}
                </div>
              )}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.priority === 'urgent' ? 'Use for life-threatening or time-critical situations' :
               formData.priority === 'high' ? 'Use for situations requiring immediate attention' :
               formData.priority === 'low' ? 'Use for minor incidents with no urgency' :
               'Standard processing timeline'}
            </p>
          </div>
        </div>
      </Card>

      {/* Supporting Documents */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Supporting Documents
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload photos, reports, receipts, or other supporting documents
            </p>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            {formData.documents.length} uploaded
          </Badge>
        </div>

        <FileUpload
          onUpload={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.heic,.heif,.txt"
          maxSize={10 * 1024 * 1024} // 10MB
          maxTotalSize={50 * 1024 * 1024} // 50MB
          multiple
          label="Drag & drop files here or click to browse"
          description="Upload supporting documents (max 10MB each, total 50MB)"
        />

        {formData.documents.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Uploaded Documents
            </h3>
            
            <div className="space-y-3">
              {formData.documents.map((doc, index) => {
                const Icon = doc.type?.startsWith('image/') ? Upload : 
                            doc.type === 'application/pdf' ? FileText : 
                            FileText;
                
                return (
                  <div
                    key={doc.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{doc.type || 'Unknown type'}</span>
                          {doc.uploadedAt && (
                            <>
                              <span>•</span>
                              <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
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

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total size:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatFileSize(formData.documents.reduce((sum, doc) => sum + (doc.size || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Documents */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Recommended Documents
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Police reports (for theft/accident claims)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Medical reports (for illness/injury claims)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Repair estimates or invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Photos of damage or incident scene</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Receipts for any immediate expenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Witness statements or contact information</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Additional Information
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Information for Investigation
            </label>
            <TextArea
              value={formData.contactInfo}
              onChange={(e) => handleInputChange('contactInfo', e.target.value)}
              placeholder="Provide contact information for any witnesses, medical professionals, or other parties involved...
Example:
- Witness: John Doe, (123) 456-7890, johndoe@email.com
- Doctor: Dr. Jane Smith, City Hospital, (123) 456-7891
- Police Report #: 2024-12345, Officer Johnson"
              rows={3}
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">
              Include names, phone numbers, email addresses, and relevant details
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Instructions or Notes
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information that might help with the claim investigation...
Example:
- Incident occurred during business hours
- Security cameras available at location
- Previous similar incidents
- Special circumstances to consider"
              rows={3}
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional information for the claims adjuster
            </p>
          </div>
        </div>
      </Card>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submission Confirmation */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {mode === 'create' ? 'Ready to Submit' : 'Ready to Update'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {mode === 'create' 
                ? 'Review your claim information before submission. Once submitted, you will receive a confirmation email and claim number.'
                : 'Review your changes before updating. The claim status may be updated based on the new information.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Estimated Review Time:</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white ml-4">
                  {formData.priority === 'urgent' ? '24-48 hours' :
                   formData.priority === 'high' ? '3-5 business days' :
                   '7-10 business days'}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Documents Required:</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white ml-4">
                  {formData.documents.length > 0 ? 'Uploaded ✓' : 'Not uploaded'}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Policy Coverage:</span>
                </div>
                <div className={`font-medium ml-4 ${
                  calculateRemainingCoverage() >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {calculateRemainingCoverage() >= 0 
                    ? 'Within coverage limits ✓' 
                    : 'Exceeds coverage limits!'}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Contact Information:</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-white ml-4">
                  {formData.contactInfo ? 'Provided ✓' : 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Final Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'create' ? (
            <>
              By submitting this claim, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Terms of Service
              </a>{' '}
              and confirm that all information provided is accurate.
            </>
          ) : (
            'All changes will be recorded in the claim history.'
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            size="lg"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="min-w-[180px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {mode === 'create' ? 'Submitting...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {mode === 'create' ? 'Submit Claim Now' : 'Update Claim'}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  );
};