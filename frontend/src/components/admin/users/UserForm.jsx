import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, X, User, Mail, Phone,
  Lock, Calendar, MapPin, Shield,
  Upload, CheckCircle, AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { TextArea } from '@/components/ui/Form/TextArea';
import { DatePicker } from '@/components/ui/Form/DatePicker';
import { Badge } from '@/components/ui/Badge/Badge';

export const UserForm = ({ initialData = {}, onSubmit, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    role: initialData.role || 'customer',
    status: initialData.status || 'active',
    dateOfBirth: initialData.dateOfBirth || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zipCode: initialData.zipCode || '',
    country: initialData.country || 'US',
    notes: initialData.notes || '',
    avatar: initialData.avatar || null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(initialData.avatar);

  const roles = [
    { value: 'customer', label: 'Customer' },
    { value: 'agent', label: 'Agent' },
    { value: 'support', label: 'Support Staff' },
    { value: 'admin', label: 'Administrator' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation (basic)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Password validation for new users
    if (mode === 'create') {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 18) {
        newErrors.dateOfBirth = 'User must be at least 18 years old';
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        ...(mode === 'create' && { password })
      };

      await onSubmit?.(userData);
    } catch (error) {
      console.error('Failed to save user:', error);
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

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, avatar: 'File size must be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'File must be an image' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        handleInputChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
    setConfirmPassword(password);
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
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Create a new user account' 
              : 'Update user information'}
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
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create User' : 'Update User'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar Upload */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Profile Photo
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload a profile photo (Max 5MB, JPG, PNG, or GIF)
                </p>
                {errors.avatar && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.avatar}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  error={errors.firstName}
                  icon={User}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  error={errors.lastName}
                  icon={User}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  error={errors.email}
                  icon={Mail}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone}
                  icon={Phone}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <DatePicker
                  value={formData.dateOfBirth}
                  onChange={(date) => handleInputChange('dateOfBirth', date)}
                  error={errors.dateOfBirth}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <Select
                  value={formData.role}
                  onChange={(value) => handleInputChange('role', value)}
                  options={roles}
                  error={errors.role}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statuses}
                  error={errors.status}
                />
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
              Address Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  error={errors.address}
                  icon={MapPin}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                    error={errors.city}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State *
                  </label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="NY"
                    error={errors.state}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ZIP Code *
                  </label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="10001"
                    error={errors.zipCode}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <Select
                  value={formData.country}
                  onChange={(value) => handleInputChange('country', value)}
                  options={countries}
                />
              </div>
            </div>
          </Card>

          {/* Account Security */}
          {mode === 'create' && (
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
                Account Security
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Generate Password
                    </button>
                  </div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    error={errors.password}
                    icon={Lock}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Must be at least 8 characters with letters, numbers, and symbols
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    error={errors.confirmPassword}
                    icon={Lock}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
              Additional Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this user..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Internal notes only - not visible to the user
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Form Summary */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Form Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {formData.email || 'Not set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {roles.find(r => r.value === formData.role)?.label}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge className={
                  formData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : formData.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }>
                  {statuses.find(s => s.value === formData.status)?.label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {formData.city ? `${formData.city}, ${formData.state}` : 'Not set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Account:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {mode === 'create' ? 'New User' : 'Existing User'}
                </span>
              </div>
            </div>
          </Card>

          {/* Required Fields Info */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Required Information
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>All fields marked with * are required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Valid email address format</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>User must be at least 18 years old</span>
                  </li>
                  {mode === 'create' && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Secure password (8+ characters)</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
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
            </div>
          )}

          {/* Role Permissions */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Role Permissions
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>• Customer: Can view policies, submit claims</p>
                  <p>• Agent: Can manage policies, view claims</p>
                  <p>• Support: Can assist users, view all data</p>
                  <p>• Admin: Full system access and control</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="sticky top-6 space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating User...' : 'Updating User...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {mode === 'create' ? 'Create User Account' : 'Update User'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};export default UserForm;
