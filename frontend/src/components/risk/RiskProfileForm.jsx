// frontend/src/components/risk/RiskProfileForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Save, AlertCircle, User, Heart, DollarSign, 
  Briefcase, TrendingUp, MapPin, CheckCircle, XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/hooks/useToast';
import { riskService } from '@/services/api';

export const RiskProfileForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    age: initialData.age || 30,
    occupation: initialData.occupation || 'professional',
    employmentStatus: initialData.employmentStatus || 'employed',
    annualIncome: initialData.annualIncome || 60000,
    healthStatus: initialData.healthStatus || 'good',
    isSmoker: initialData.isSmoker || false,
    hasChronicIllness: initialData.hasChronicIllness || false,
    bmi: initialData.bmi || 22,
    creditScore: initialData.creditScore || 700,
    hasDangerousHobbies: initialData.hasDangerousHobbies || false,
    locationRisk: initialData.locationRisk || 'medium',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (formData.age < 18 || formData.age > 100) newErrors.age = 'Age must be 18-100';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('error', 'Please fix the errors');
      return;
    }

    try {
      setLoading(true);
      const response = await riskService.createOrUpdateRiskProfile(formData);
      showToast('success', 'Risk profile saved successfully!');
      onSubmit?.(response.data);
    } catch (error) {
      showToast('error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (bmi < 18.5) return 'text-blue-600 dark:text-blue-400';
    if (bmi < 25) return 'text-green-600 dark:text-green-400';
    if (bmi < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCreditScoreColor = (score) => {
    if (score < 580) return 'text-red-600 dark:text-red-400';
    if (score < 670) return 'text-orange-600 dark:text-orange-400';
    if (score < 740) return 'text-yellow-600 dark:text-yellow-400';
    if (score < 800) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
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

  const healthStatusOptions = [
    { value: 'excellent', label: 'Excellent', color: 'text-green-600' },
    { value: 'good', label: 'Good', color: 'text-blue-600' },
    { value: 'average', label: 'Average', color: 'text-yellow-600' },
    { value: 'poor', label: 'Poor', color: 'text-red-600' },
  ];

  const locationRiskOptions = [
    { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8 p-4 md:p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Risk Profile
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in your details to get a personalized risk assessment
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Completion
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            60%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Complete all sections for accurate assessment
        </p>
      </div>

      {/* Form Sections */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
        
        {/* Section 1: Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.firstName}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </motion.div>

        {/* Section 2: Demographics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Demographics
            </h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Age: <span className="text-blue-600 dark:text-blue-400 font-bold ml-2">{formData.age} years</span>
            </label>
            <input
              type="range"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              min="18"
              max="100"
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>18</span>
              <span>30</span>
              <span>50</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Occupation
              </label>
              <select
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none appearance-none"
              >
                {occupations.map((occ) => (
                  <option key={occ.value} value={occ.value}>
                    {occ.label} ({occ.risk} risk)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employment Status
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => handleChange('employmentStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none appearance-none"
              >
                {employmentOptions.map((emp) => (
                  <option key={emp.value} value={emp.value}>
                    {emp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Annual Income: <span className="text-green-600 dark:text-green-400 font-bold ml-2">${formData.annualIncome.toLocaleString()}</span>
            </label>
            <input
              type="range"
              value={formData.annualIncome}
              onChange={(e) => handleChange('annualIncome', parseInt(e.target.value))}
              min="20000"
              max="200000"
              step="5000"
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>$20K</span>
              <span>$100K</span>
              <span>$200K</span>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Health */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Health Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Health Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {healthStatusOptions.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => handleChange('healthStatus', status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.healthStatus === status.value
                      ? `${status.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' :
                          status.color === 'text-blue-600' ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300' :
                          status.color === 'text-yellow-600' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 border-2 border-red-300'}`
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className={status.color}>
                      {status.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                BMI: <span className={`font-bold ${getBMIColor(formData.bmi)}`}>
                  {formData.bmi} ({getBMIStatus(formData.bmi)})
                </span>
              </label>
              <input
                type="range"
                value={formData.bmi}
                onChange={(e) => handleChange('bmi', parseFloat(e.target.value))}
                min="15"
                max="40"
                step="0.5"
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isSmoker}
                onChange={(e) => handleChange('isSmoker', e.target.checked)}
                className="w-5 h-5 text-red-600 dark:text-red-500 rounded border-gray-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                    Smoker
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                    HIGH RISK
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tobacco use increases health risks significantly
                </p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.hasChronicIllness}
                onChange={(e) => handleChange('hasChronicIllness', e.target.checked)}
                className="w-5 h-5 text-yellow-600 dark:text-yellow-500 rounded border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                    Chronic Illness
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                    MEDIUM RISK
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Long-term health conditions
                </p>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Section 4: Financial */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Information
            </h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Credit Score: <span className={`font-bold ${getCreditScoreColor(formData.creditScore)}`}>
                {formData.creditScore}
              </span>
            </label>
            <input
              type="range"
              value={formData.creditScore}
              onChange={(e) => handleChange('creditScore', parseInt(e.target.value))}
              min="300"
              max="850"
              step="10"
              className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:shadow-lg"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="text-red-600">Poor</span>
              <span className="text-orange-600">Fair</span>
              <span className="text-yellow-600">Good</span>
              <span className="text-blue-600">Very Good</span>
              <span className="text-green-600">Excellent</span>
            </div>
          </div>
        </motion.div>

        {/* Section 5: Lifestyle & Location */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lifestyle & Location
            </h3>
          </div>
          
          <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.hasDangerousHobbies}
              onChange={(e) => handleChange('hasDangerousHobbies', e.target.checked)}
              className="w-5 h-5 text-purple-600 dark:text-purple-500 rounded border-gray-300 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Dangerous Hobbies
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                  EXTREME RISK
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Extreme sports or hazardous activities
              </p>
            </div>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Location Risk Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {locationRiskOptions.map((location) => (
                <button
                  key={location.value}
                  type="button"
                  onClick={() => handleChange('locationRisk', location.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${formData.locationRisk === location.value
                    ? `${location.color} border-2 border-opacity-50`
                    : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field} className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 text-base font-medium rounded-xl border-2 hover:scale-105 transition-transform"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              Save Risk Profile
            </>
          )}
        </Button>
      </motion.div>

      {/* Security Note */}
      <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Your information is encrypted and secure</span>
        </div>
      </div>
    </motion.form>
  );
};

export default RiskProfileForm;