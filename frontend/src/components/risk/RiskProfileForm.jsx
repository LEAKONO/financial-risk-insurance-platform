// frontend/src/components/risk/RiskProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Paperclip, ChevronRight } from 'lucide-react';
import {
  User, Briefcase, Heart, MapPin,
  DollarSign, TrendingUp, Shield,
  Save, Upload, AlertCircle, CheckCircle,
  Percent, Target, Activity, Globe,
  ChartBar
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { Slider } from '@/components/ui/Form/Slider';
import { TextArea } from '@/components/ui/Form/TextArea';
import { FileUpload } from '@/components/ui/Form/FileUpload';
import { Badge } from '@/components/ui/Badge/Badge';
import { useToast } from '@/hooks/useToast';
import { riskService } from '@/services/api';

const employmentOptions = [
  { value: 'employed', label: 'Employed', color: 'bg-green-500' },
  { value: 'self_employed', label: 'Self-Employed', color: 'bg-blue-500' },
  { value: 'unemployed', label: 'Unemployed', color: 'bg-yellow-500' },
  { value: 'retired', label: 'Retired', color: 'bg-purple-500' },
  { value: 'student', label: 'Student', color: 'bg-indigo-500' }
];

const occupationOptions = [
  { value: 'professional', label: 'Professional', risk: 'low' },
  { value: 'administrative', label: 'Administrative', risk: 'low' },
  { value: 'manual', label: 'Manual Labor', risk: 'medium' },
  { value: 'hazardous', label: 'Hazardous', risk: 'high' },
  { value: 'healthcare', label: 'Healthcare', risk: 'medium' },
  { value: 'education', label: 'Education', risk: 'low' },
  { value: 'technology', label: 'Technology', risk: 'low' },
  { value: 'finance', label: 'Finance', risk: 'low' },
  { value: 'unemployed', label: 'Unemployed', risk: 'medium' }
];

const healthOptions = [
  { value: 'excellent', label: 'Excellent', color: 'text-green-600' },
  { value: 'good', label: 'Good', color: 'text-blue-600' },
  { value: 'average', label: 'Average', color: 'text-yellow-600' },
  { value: 'poor', label: 'Poor', color: 'text-red-600' }
];

const exerciseOptions = [
  { value: 'none', label: 'None', icon: '🚫' },
  { value: 'light', label: 'Light (1-2 times/week)', icon: '🚶' },
  { value: 'moderate', label: 'Moderate (3-4 times/week)', icon: '🏃' },
  { value: 'active', label: 'Active (5+ times/week)', icon: '💪' }
];

// Helper to get safe initial data
const getSafeInitialData = (initialData) => {
  if (!initialData || typeof initialData !== 'object') {
    return {
      // Personal Information
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      
      // Demographic Information
      age: 30,
      occupation: 'professional',
      employmentStatus: 'employed',
      annualIncome: 60000,
      
      // Health Information
      healthStatus: 'good',
      isSmoker: false,
      hasChronicIllness: false,
      bmi: 22,
      lastHealthCheck: '',
      
      // Lifestyle
      hasDangerousHobbies: false,
      hobbies: [],
      exerciseFrequency: 'moderate',
      
      // Financial
      creditScore: 700,
      hasBankruptcyHistory: false,
      totalDebt: 0,
      savingsAmount: 0,
      
      // Geographic
      location: {
        country: '',
        city: '',
        riskZone: 'medium'
      },
      
      // Additional Information
      familyHistory: '',
      notes: '',
      documents: []
    };
  }
  
  return {
    // Personal Information
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    
    // Demographic Information
    age: initialData.age || 30,
    occupation: initialData.occupation || 'professional',
    employmentStatus: initialData.employmentStatus || 'employed',
    annualIncome: initialData.annualIncome || 60000,
    
    // Health Information
    healthStatus: initialData.healthStatus || 'good',
    isSmoker: initialData.isSmoker || false,
    hasChronicIllness: initialData.hasChronicIllness || false,
    bmi: initialData.bmi || 22,
    lastHealthCheck: initialData.lastHealthCheck || '',
    
    // Lifestyle
    hasDangerousHobbies: initialData.hasDangerousHobbies || false,
    hobbies: initialData.hobbies || [],
    exerciseFrequency: initialData.exerciseFrequency || 'moderate',
    
    // Financial
    creditScore: initialData.creditScore || 700,
    hasBankruptcyHistory: initialData.hasBankruptcyHistory || false,
    totalDebt: initialData.totalDebt || 0,
    savingsAmount: initialData.savingsAmount || 0,
    
    // Geographic
    location: {
      country: initialData.location?.country || '',
      city: initialData.location?.city || '',
      riskZone: initialData.location?.riskZone || 'medium'
    },
    
    // Additional Information
    familyHistory: initialData.familyHistory || '',
    notes: initialData.notes || '',
    documents: initialData.documents || []
  };
};

export const RiskProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const safeInitialData = getSafeInitialData(initialData);
  const [formData, setFormData] = useState(safeInitialData);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('personal');
  const { showToast } = useToast();

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'email',
      'age', 'occupation', 'employmentStatus', 'annualIncome',
      'healthStatus', 'creditScore'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field];
      return value !== '' && value !== null && value !== undefined;
    }).length;
    
    setProgress(Math.round((completedFields / requiredFields.length) * 100));
  }, [formData]);

  const sections = [
    {
      id: 'personal',
      title: 'Personal Info',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      description: 'Basic identification details'
    },
    {
      id: 'demographic',
      title: 'Demographics',
      icon: ChartBar,
      color: 'from-emerald-500 to-green-500',
      description: 'Age, occupation & income'
    },
    {
      id: 'health',
      title: 'Health',
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      description: 'Health status & habits'
    },
    {
      id: 'financial',
      title: 'Financial',
      icon: DollarSign,
      color: 'from-amber-500 to-yellow-500',
      description: 'Credit score & finances'
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      description: 'Hobbies & activities'
    },
    {
      id: 'geographic',
      title: 'Location',
      icon: MapPin,
      color: 'from-indigo-500 to-blue-500',
      description: 'Geographic information'
    }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (formData.age < 18 || formData.age > 100) newErrors.age = 'Age must be between 18 and 100';
    if (formData.annualIncome < 0) newErrors.annualIncome = 'Annual income cannot be negative';
    if (formData.creditScore < 300 || formData.creditScore > 850) newErrors.creditScore = 'Credit score must be between 300-850';
    
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
      
      const response = await riskService.createOrUpdateRiskProfile(formData);
      
      showToast('success', 'Risk profile saved successfully!');
      onSubmit?.(response.data);
    } catch (error) {
      showToast('error', error.message || 'Failed to save risk profile');
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

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const addHobby = (hobby) => {
    if (hobby.trim() && !formData.hobbies.includes(hobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, hobby.trim()]
      }));
    }
  };

  const removeHobby = (index) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index)
    }));
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getCreditScoreColor = (score) => {
    if (score < 580) return 'text-red-600 dark:text-red-400';
    if (score < 670) return 'text-orange-600 dark:text-orange-400';
    if (score < 740) return 'text-yellow-600 dark:text-yellow-400';
    if (score < 800) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBMIColor = (bmi) => {
    if (bmi < 18.5) return 'text-blue-600 dark:text-blue-400';
    if (bmi < 25) return 'text-green-600 dark:text-green-400';
    if (bmi < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getEmploymentColor = (status) => {
    const option = employmentOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-500';
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.dateOfBirth}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </motion.div>
        );

      case 'demographic':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Age: <span className="text-blue-600 dark:text-blue-400 font-bold">{formData.age} years</span>
              </label>
              <Slider
                value={formData.age}
                onChange={(value) => handleInputChange('age', value)}
                min={18}
                max={100}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>18</span>
                <span>25</span>
                <span>35</span>
                <span>50</span>
                <span>65+</span>
              </div>
              {errors.age && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.age}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupation *
                </label>
                <Select
                  value={formData.occupation}
                  onChange={(value) => handleInputChange('occupation', value)}
                  options={occupationOptions.map(opt => ({
                    value: opt.value,
                    label: (
                      <div className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        <Badge className={getRiskColor(opt.risk)}>
                          {opt.risk.toUpperCase()}
                        </Badge>
                      </div>
                    )
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Status *
                </label>
                <Select
                  value={formData.employmentStatus}
                  onChange={(value) => handleInputChange('employmentStatus', value)}
                  options={employmentOptions.map(opt => ({
                    value: opt.value,
                    label: (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                    )
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Income *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <Input
                  type="number"
                  value={formData.annualIncome}
                  onChange={(e) => handleInputChange('annualIncome', parseInt(e.target.value) || 0)}
                  error={errors.annualIncome}
                  min="0"
                  step="1000"
                  className="pl-10"
                />
              </div>
            </div>
          </motion.div>
        );

      case 'health':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {healthOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('healthStatus', option.value)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.healthStatus === option.value
                          ? `${option.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/30 border-green-300' :
                              option.color === 'text-blue-600' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300' :
                              option.color === 'text-yellow-600' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300' :
                              'bg-red-100 dark:bg-red-900/30 border-red-300'} border-2`
                          : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`font-semibold ${option.color}`}>
                        {option.label}
                      </div>
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
                <Slider
                  value={formData.bmi}
                  onChange={(value) => handleInputChange('bmi', value)}
                  min={15}
                  max={40}
                  step={0.5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Health Habits
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isSmoker}
                      onChange={(e) => handleInputChange('isSmoker', e.target.checked)}
                      className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">Smoker</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tobacco use</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      High Risk
                    </Badge>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.hasChronicIllness}
                      onChange={(e) => handleInputChange('hasChronicIllness', e.target.checked)}
                      className="w-5 h-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">Chronic Illness</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Long-term conditions</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Medium Risk
                    </Badge>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Health Check
                </label>
                <input
                  type="date"
                  value={formData.lastHealthCheck}
                  onChange={(e) => handleInputChange('lastHealthCheck', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </motion.div>
        );

      case 'financial':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Credit Score: <span className={`font-bold ${getCreditScoreColor(formData.creditScore)}`}>
                  {formData.creditScore}
                </span>
              </label>
              <Slider
                value={formData.creditScore}
                onChange={(value) => handleInputChange('creditScore', value)}
                min={300}
                max={850}
                step={10}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden mb-2">
                <div className="w-1/5 bg-red-500" />
                <div className="w-1/5 bg-orange-500" />
                <div className="w-1/5 bg-yellow-500" />
                <div className="w-1/5 bg-blue-500" />
                <div className="w-1/5 bg-green-500" />
              </div>
              {errors.creditScore && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.creditScore}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Debt ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    type="number"
                    value={formData.totalDebt}
                    onChange={(e) => handleInputChange('totalDebt', parseInt(e.target.value) || 0)}
                    min="0"
                    step="1000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Savings Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    type="number"
                    value={formData.savingsAmount}
                    onChange={(e) => handleInputChange('savingsAmount', parseInt(e.target.value) || 0)}
                    min="0"
                    step="1000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={formData.hasBankruptcyHistory}
                onChange={(e) => handleInputChange('hasBankruptcyHistory', e.target.checked)}
                className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">Bankruptcy History</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Past financial difficulties</p>
              </div>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                High Impact
              </Badge>
            </label>
          </motion.div>
        );

      case 'lifestyle':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercise Frequency
                </label>
                <div className="space-y-2">
                  {exerciseOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('exerciseFrequency', option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.exerciseFrequency === option.value
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300'
                          : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="flex-1 text-left">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dangerous Hobbies
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasDangerousHobbies}
                    onChange={(e) => handleInputChange('hasDangerousHobbies', e.target.checked)}
                    className="w-5 h-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">Dangerous Activities</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Extreme sports, etc.</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    Medium Risk
                  </Badge>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hobbies & Activities
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a hobby (e.g., Reading, Hiking, Painting...)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target;
                        addHobby(input.value);
                        input.value = '';
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addHobby(input.value);
                      input.value = '';
                    }}
                    className="px-6"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map((hobby, index) => (
                    <Badge
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-300"
                    >
                      <span>{hobby}</span>
                      <button
                        type="button"
                        onClick={() => removeHobby(index)}
                        className="text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'geographic':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <Input
                  value={formData.location.country}
                  onChange={(e) => handleLocationChange('country', e.target.value)}
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <Input
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Location Risk Zone
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low Risk', color: 'bg-green-500', desc: 'Safe areas' },
                  { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-500', desc: 'Average risk' },
                  { value: 'high', label: 'High Risk', color: 'bg-red-500', desc: 'High-risk zones' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLocationChange('riskZone', option.value)}
                    className={`p-4 rounded-xl text-sm font-medium transition-all ${
                      formData.location.riskZone === option.value
                        ? `${option.value === 'low' 
                            ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300' 
                            : option.value === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300'
                            : 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300'}`
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-3 h-3 ${option.color} rounded-full mb-2`} />
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Risk Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fill out all sections below to get your personalized risk assessment
          </p>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Profile Completion
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {progress < 50 ? 'Keep going! Complete more sections.' :
                 progress < 80 ? 'Great progress! Almost there.' :
                 'Excellent! Ready to submit.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {progress}%
                </div>
              </div>
              <div className="w-48">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      progress < 50 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      progress < 80 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {sections.map((section) => {
              // Simple completion check (just checking if any data exists for demo)
              const isComplete = progress > 80; // Simplified for demo
              
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`text-center p-3 rounded-xl transition-all ${
                    activeSection === section.id
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg transform scale-105`
                      : isComplete
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    activeSection === section.id
                      ? 'bg-white/20'
                      : isComplete
                      ? 'bg-green-100 dark:bg-green-800'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {React.createElement(section.icon, { 
                      className: `w-4 h-4 ${
                        activeSection === section.id
                          ? 'text-white'
                          : isComplete
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }` 
                    })}
                  </div>
                  <div className="font-medium text-sm mb-1">{section.title}</div>
                  <div className="text-xs opacity-75">{section.description}</div>
                  {isComplete && activeSection !== section.id && (
                    <CheckCircle className="w-4 h-4 text-green-500 absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Section Header */}
          <div className={`bg-gradient-to-r ${sections.find(s => s.id === activeSection)?.color || 'from-gray-500 to-gray-600'} px-8 py-6`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {React.createElement(sections.find(s => s.id === activeSection)?.icon || User, { 
                  className: "w-5 h-5 text-white" 
                })}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {sections.find(s => s.id === activeSection)?.title || 'Section'}
                </h2>
                <p className="text-white/80 text-sm">
                  {sections.find(s => s.id === activeSection)?.description || 'Complete this section'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-8">
            {renderSection()}
          </div>
        </div>

        {/* Additional Information (Always visible) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Additional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Family Medical History
              </label>
              <TextArea
                value={formData.familyHistory}
                onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                placeholder="Describe any relevant family medical history..."
                rows={4}
                className="min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes
              </label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any other information relevant to your risk assessment..."
                rows={4}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supporting Documents
            </label>
            <FileUpload
              onUpload={(files) => {
                setFormData(prev => ({
                  ...prev,
                  documents: [...prev.documents, ...files.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadedAt: new Date().toISOString()
                  }))]
                }));
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
              multiple
            />
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploaded files:</p>
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 text-lg">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-2">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Your information is secure and encrypted</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="px-8 py-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[160px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Risk Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              icon: Shield,
              title: 'Data Security',
              description: 'Bank-level encryption protects all your information',
              color: 'from-green-500 to-emerald-500'
            },
            {
              icon: Target,
              title: 'Precision Matters',
              description: 'More complete profiles yield more accurate assessments',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Percent,
              title: 'Better Premiums',
              description: 'Complete profiles often qualify for better rates',
              color: 'from-purple-500 to-pink-500'
            }
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.form>
  );
};

export default RiskProfileForm;