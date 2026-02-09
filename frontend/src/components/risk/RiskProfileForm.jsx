import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Save, AlertCircle, User, Heart, DollarSign, 
  Briefcase, MapPin, CheckCircle, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/hooks/useToast';
import { riskService } from '@/services/api';

export const RiskProfileForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // ✅ SIMPLIFIED & CORRECT DATA STRUCTURE
  const [formData, setFormData] = useState({
    age: initialData.age || 30,
    occupation: initialData.occupation || 'professional',
    employmentStatus: initialData.employmentStatus || 'employed',
    annualIncome: initialData.annualIncome || 60000,
    smoker: initialData.smoker || false,
    hasChronicIllness: initialData.hasChronicIllness || false,
    bmi: initialData.bmi || 22,
    creditScore: initialData.creditScore || 700,
    hasDangerousHobbies: initialData.hasDangerousHobbies || false,
    location: {
      riskZone: initialData.location?.riskZone || 'medium'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ SIMPLE VALIDATION
    const newErrors = {};
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Age must be 18-100';
    }
    if (!formData.occupation) newErrors.occupation = 'Occupation required';
    if (!formData.annualIncome || formData.annualIncome < 1000) {
      newErrors.annualIncome = 'Income must be at least $1,000';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('error', 'Please fix the errors');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ PREPARE DATA FOR BACKEND
      const riskData = {
        age: parseInt(formData.age),
        occupation: formData.occupation,
        employmentStatus: formData.employmentStatus,
        annualIncome: parseInt(formData.annualIncome),
        smoker: formData.smoker,
        hasChronicIllness: formData.hasChronicIllness,
        bmi: parseFloat(formData.bmi),
        creditScore: parseInt(formData.creditScore),
        hasDangerousHobbies: formData.hasDangerousHobbies,
        location: {
          riskZone: formData.location.riskZone
        }
      };

      console.log('Sending risk data:', riskData);
      
      const response = await riskService.createOrUpdateRiskProfile(riskData);
      
      if (response.success) {
        showToast('success', 'Risk profile saved successfully!');
        onSubmit?.(response.data);
      } else {
        showToast('error', response.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving risk profile:', error);
      showToast('error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'location.riskZone') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, riskZone: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const occupations = [
    { value: 'professional', label: 'Professional', risk: 'low' },
    { value: 'technology', label: 'Technology', risk: 'low' },
    { value: 'healthcare', label: 'Healthcare', risk: 'medium' },
    { value: 'education', label: 'Education', risk: 'low' },
    { value: 'construction', label: 'Construction', risk: 'high' },
    { value: 'hazardous', label: 'Hazardous', risk: 'very high' },
    { value: 'unemployed', label: 'Unemployed', risk: 'medium' },
  ];

  const employmentOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' },
  ];

  const locationRiskOptions = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
  ];

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Risk Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Required for policy creation
        </p>
      </div>

      {/* REQUIRED FIELDS ONLY */}
      <div className="space-y-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            min="18"
            max="100"
            required
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.age}
            </p>
          )}
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Occupation *
          </label>
          <select
            value={formData.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Occupation</option>
            {occupations.map((occ) => (
              <option key={occ.value} value={occ.value}>
                {occ.label}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employment Status *
          </label>
          <select
            value={formData.employmentStatus}
            onChange={(e) => handleChange('employmentStatus', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            {employmentOptions.map((emp) => (
              <option key={emp.value} value={emp.value}>
                {emp.label}
              </option>
            ))}
          </select>
        </div>

        {/* Annual Income */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Annual Income (USD) *
          </label>
          <input
            type="number"
            value={formData.annualIncome}
            onChange={(e) => handleChange('annualIncome', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            min="1000"
            step="1000"
            required
          />
          {errors.annualIncome && (
            <p className="mt-1 text-sm text-red-600">{errors.annualIncome}</p>
          )}
        </div>

        {/* Health Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Health Information
          </h3>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.smoker}
              onChange={(e) => handleChange('smoker', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Smoker</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasChronicIllness}
              onChange={(e) => handleChange('hasChronicIllness', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Chronic Illness</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              BMI
            </label>
            <input
              type="number"
              value={formData.bmi}
              onChange={(e) => handleChange('bmi', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="15"
              max="50"
            />
            {formData.bmi && (
              <p className={`mt-1 text-sm ${getBMIColor(formData.bmi)}`}>
                {getBMIStatus(formData.bmi)}
              </p>
            )}
          </div>
        </div>

        {/* Credit Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Credit Score
          </label>
          <input
            type="range"
            value={formData.creditScore}
            onChange={(e) => handleChange('creditScore', e.target.value)}
            min="300"
            max="850"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>300</span>
            <span className="font-medium">{formData.creditScore}</span>
            <span>850</span>
          </div>
        </div>

        {/* Location Risk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location Risk Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {locationRiskOptions.map((location) => (
              <button
                key={location.value}
                type="button"
                onClick={() => handleChange('location.riskZone', location.value)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  formData.location.riskZone === location.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {location.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dangerous Hobbies */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasDangerousHobbies}
            onChange={(e) => handleChange('hasDangerousHobbies', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Dangerous Hobbies</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              Save Risk Profile
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};

export default RiskProfileForm;