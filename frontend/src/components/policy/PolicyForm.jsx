import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, X, Upload, Calendar, User, 
  Building, MapPin, Phone, Mail, 
  AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { TextArea } from '@/components/ui/Form/TextArea';
import { DatePicker } from '@/components/ui/Form/DatePicker';
import { FileUpload } from '@/components/ui/Form/FileUpload';
import { useToast } from '@/hooks/useToast';
import { policyService } from '@/services/api';

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
  const { showToast } = useToast();

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
      
      const policyData = {
        ...formData,
        coverageAmount: parseFloat(formData.coverageAmount),
        termLength: parseInt(formData.termLength)
      };

      if (mode === 'create') {
        const result = await policyService.createPolicy(policyData);
        showToast('success', 'Policy created successfully!');
        onSubmit?.(result.data);
      } else {
        const result = await policyService.updatePolicy(initialData.id, policyData);
        showToast('success', 'Policy updated successfully!');
        onSubmit?.(result.data);
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to save policy');
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

  const handleBeneficiaryChange = (index, field, value) => {
    const updatedBeneficiaries = [...formData.beneficiaries];
    updatedBeneficiaries[index] = {
      ...updatedBeneficiaries[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, beneficiaries: updatedBeneficiaries }));
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

  const handleDocumentUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }))]
    }));
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create New Policy' : 'Edit Policy'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below to {mode === 'create' ? 'create' : 'update'} your insurance policy
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Policy' : 'Update Policy'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Policy Details Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Policy Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Policy Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Family Life Insurance Policy"
              error={errors.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Policy Type *
            </label>
            <Select
              value={formData.policyType}
              onChange={(value) => handleInputChange('policyType', value)}
              options={policyTypes}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coverage Amount ($) *
            </label>
            <Input
              type="number"
              value={formData.coverageAmount}
              onChange={(e) => handleInputChange('coverageAmount', e.target.value)}
              min="1000"
              step="1000"
              error={errors.coverageAmount}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum coverage: $1,000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Term Length *
            </label>
            <Select
              value={formData.termLength}
              onChange={(value) => handleInputChange('termLength', value)}
              options={termOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date *
            </label>
            <DatePicker
              value={formData.startDate}
              onChange={(date) => handleInputChange('startDate', date)}
              error={errors.startDate}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Premium Frequency
            </label>
            <Select
              value={formData.premiumFrequency}
              onChange={(value) => handleInputChange('premiumFrequency', value)}
              options={premiumFrequencyOptions}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your policy details..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Beneficiaries Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Beneficiaries
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBeneficiary}
          >
            <User className="w-4 h-4 mr-2" />
            Add Beneficiary
          </Button>
        </div>

        <div className="space-y-4">
          {formData.beneficiaries.map((beneficiary, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  value={beneficiary.name}
                  onChange={(e) => handleBeneficiaryChange(index, 'name', e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relationship
                </label>
                <Select
                  value={beneficiary.relationship}
                  onChange={(value) => handleBeneficiaryChange(index, 'relationship', value)}
                  options={[
                    { value: 'spouse', label: 'Spouse' },
                    { value: 'child', label: 'Child' },
                    { value: 'parent', label: 'Parent' },
                    { value: 'sibling', label: 'Sibling' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Percentage (%)
                </label>
                <Input
                  type="number"
                  value={beneficiary.percentage}
                  onChange={(e) => handleBeneficiaryChange(index, 'percentage', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBeneficiary(index)}
                  disabled={formData.beneficiaries.length === 1}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Remove
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Documents Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Documents
        </h2>
        
        <FileUpload
          onUpload={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          maxSize={10 * 1024 * 1024} // 10MB
          multiple
        />

        {formData.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doc.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Auto-renewal */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Auto-Renewal
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically renew this policy before expiration
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAutoRenewable}
              onChange={(e) => handleInputChange('isAutoRenewable', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
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
                  <li key={field}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};export default PolicyForm;
