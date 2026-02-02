import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Heart, MapPin,
  DollarSign, TrendingUp, Shield,
  Save, Upload, AlertCircle, CheckCircle
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
import { riskService } from '@/services/risk.service';

const employmentOptions = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' }
];

const occupationOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'manual', label: 'Manual Labor' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'unemployed', label: 'Unemployed' }
];

const locationRiskOptions = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
];

const healthOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'poor', label: 'Poor' }
];

export const RiskProfileForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      fields: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone']
    },
    {
      id: 'demographic',
      title: 'Demographic Information',
      icon: User,
      fields: ['age', 'occupation', 'employmentStatus', 'annualIncome']
    },
    {
      id: 'health',
      title: 'Health Information',
      icon: Heart,
      fields: ['healthStatus', 'isSmoker', 'hasChronicIllness', 'bmi', 'lastHealthCheck']
    },
    {
      id: 'financial',
      title: 'Financial Information',
      icon: DollarSign,
      fields: ['creditScore', 'hasBankruptcyHistory', 'totalDebt', 'savingsAmount']
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      icon: TrendingUp,
      fields: ['hasDangerousHobbies', 'hobbies', 'exerciseFrequency']
    },
    {
      id: 'geographic',
      title: 'Geographic Information',
      icon: MapPin,
      fields: ['location']
    }
  ];

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
            Risk Profile Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your profile for accurate risk assessment and premium calculation
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progress}%
            </div>
          </div>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Profile Completion
            </h3>
            <Badge className={
              progress < 50 ? 'bg-red-100 text-red-800' :
              progress < 80 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }>
              {progress < 50 ? 'Beginner' :
               progress < 80 ? 'Intermediate' : 'Complete'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {sections.map((section) => {
              const isComplete = section.fields.every(field => {
                const value = field === 'location' 
                  ? formData.location.country && formData.location.city
                  : formData[field];
                return value !== '' && value !== null && value !== undefined;
              });
              
              return (
                <div key={section.id} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    isComplete
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {React.createElement(section.icon, { className: "w-5 h-5" })}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {section.title.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Form Sections */}
      {sections.map((section) => (
        <Card key={section.id} className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              {React.createElement(section.icon, { 
                className: "w-5 h-5 text-blue-600 dark:text-blue-400" 
              })}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {section.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.id === 'personal' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
                  )}
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
                  />
                </div>
                <div className="md:col-span-2">
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
              </>
            )}

            {section.id === 'demographic' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age *
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={formData.age}
                      onChange={(value) => handleInputChange('age', value)}
                      min={18}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>18</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formData.age} years
                      </span>
                      <span>100</span>
                    </div>
                    {errors.age && (
                      <p className="text-sm text-red-600">{errors.age}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Occupation *
                  </label>
                  <Select
                    value={formData.occupation}
                    onChange={(value) => handleInputChange('occupation', value)}
                    options={occupationOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employment Status *
                  </label>
                  <Select
                    value={formData.employmentStatus}
                    onChange={(value) => handleInputChange('employmentStatus', value)}
                    options={employmentOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Annual Income ($) *
                  </label>
                  <Input
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', parseInt(e.target.value) || 0)}
                    error={errors.annualIncome}
                    min="0"
                    step="1000"
                  />
                </div>
              </>
            )}

            {section.id === 'health' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Health Status *
                  </label>
                  <Select
                    value={formData.healthStatus}
                    onChange={(value) => handleInputChange('healthStatus', value)}
                    options={healthOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body Mass Index (BMI)
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={formData.bmi}
                      onChange={(value) => handleInputChange('bmi', value)}
                      min={15}
                      max={40}
                      step={0.5}
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>15</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formData.bmi}
                      </span>
                      <span>40</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.bmi < 18.5 ? 'Underweight' :
                       formData.bmi < 25 ? 'Normal weight' :
                       formData.bmi < 30 ? 'Overweight' : 'Obese'}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Health Habits
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSmoker}
                      onChange={(e) => handleInputChange('isSmoker', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Smoker</span>
                    <Badge className="ml-auto bg-red-100 text-red-800">
                      High Risk
                    </Badge>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasChronicIllness}
                      onChange={(e) => handleInputChange('hasChronicIllness', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Chronic Illness</span>
                    <Badge className="ml-auto bg-yellow-100 text-yellow-800">
                      Medium Risk
                    </Badge>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Health Check
                  </label>
                  <input
                    type="date"
                    value={formData.lastHealthCheck}
                    onChange={(e) => handleInputChange('lastHealthCheck', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </>
            )}

            {section.id === 'financial' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credit Score *
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={formData.creditScore}
                      onChange={(value) => handleInputChange('creditScore', value)}
                      min={300}
                      max={850}
                      step={10}
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>300</span>
                      <span className={`font-semibold ${
                        formData.creditScore < 580 ? 'text-red-600' :
                        formData.creditScore < 670 ? 'text-yellow-600' :
                        formData.creditScore < 740 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {formData.creditScore}
                      </span>
                      <span>850</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.creditScore < 580 ? 'Poor' :
                       formData.creditScore < 670 ? 'Fair' :
                       formData.creditScore < 740 ? 'Good' :
                       formData.creditScore < 800 ? 'Very Good' : 'Excellent'}
                    </div>
                    {errors.creditScore && (
                      <p className="text-sm text-red-600">{errors.creditScore}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Debt ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.totalDebt}
                      onChange={(e) => handleInputChange('totalDebt', parseInt(e.target.value) || 0)}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Savings Amount ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.savingsAmount}
                      onChange={(e) => handleInputChange('savingsAmount', parseInt(e.target.value) || 0)}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasBankruptcyHistory}
                      onChange={(e) => handleInputChange('hasBankruptcyHistory', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Bankruptcy History</span>
                    <Badge className="ml-auto bg-red-100 text-red-800">
                      High Impact
                    </Badge>
                  </label>
                </div>
              </>
            )}

            {section.id === 'lifestyle' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exercise Frequency
                    </label>
                    <Select
                      value={formData.exerciseFrequency}
                      onChange={(value) => handleInputChange('exerciseFrequency', value)}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'light', label: 'Light (1-2 times/week)' },
                        { value: 'moderate', label: 'Moderate (3-4 times/week)' },
                        { value: 'active', label: 'Active (5+ times/week)' }
                      ]}
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasDangerousHobbies}
                      onChange={(e) => handleInputChange('hasDangerousHobbies', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Dangerous Hobbies</span>
                    <Badge className="ml-auto bg-yellow-100 text-yellow-800">
                      Medium Risk
                    </Badge>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hobbies & Activities
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a hobby..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addHobby(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          addHobby(input.value);
                          input.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.hobbies.map((hobby, index) => (
                        <Badge
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800"
                        >
                          {hobby}
                          <button
                            type="button"
                            onClick={() => removeHobby(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {section.id === 'geographic' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <Input
                    value={formData.location.country}
                    onChange={(e) => handleLocationChange('country', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <Input
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location Risk Zone
                  </label>
                  <div className="flex gap-2">
                    {locationRiskOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleLocationChange('riskZone', option.value)}
                        className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          formData.location.riskZone === option.value
                            ? option.value === 'low' 
                              ? 'bg-green-600 text-white' 
                              : option.value === 'medium'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      ))}

      {/* Additional Information */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Additional Information
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Family Medical History
            </label>
            <TextArea
              value={formData.familyHistory}
              onChange={(e) => handleInputChange('familyHistory', e.target.value)}
              placeholder="Describe any relevant family medical history..."
              rows={3}
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
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supporting Documents
            </label>
            <FileUpload
              onUpload={handleDocumentUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024} // 10MB
              multiple
            />
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
                  <li key={field}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Your information is secure and encrypted</span>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || progress < 50}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Risk Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.form>
  );
};