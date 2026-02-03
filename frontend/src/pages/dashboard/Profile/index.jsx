import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BellIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  PencilIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';
import Switch from '../../../components/ui/Form/Switch.jsx';
import Modal from '../../../components/ui/Modal/Modal';

const DashboardProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUploadPhotoOpen, setIsUploadPhotoOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-06-15',
    address: '123 Main St, New York, NY 10001',
    occupation: 'Software Engineer',
    annualIncome: '$120,000',
    riskScore: 65,
    membershipDate: '2023-01-15',
    lastLogin: '2024-01-25 14:30'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    policyUpdates: true,
    claimUpdates: true,
    marketingEmails: false,
    securityAlerts: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    biometricLogin: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'preferences', label: 'Preferences', icon: DevicePhoneMobileIcon }
  ];

  const handleSave = () => {
    // In a real app, this would make an API call
    setIsEditing(false);
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        
        {!isEditing && activeTab === 'personal' && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* Profile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <UserIcon className="w-16 h-16" />
            </div>
            <button
              onClick={() => setIsUploadPhotoOpen(true)}
              className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-blue-100 mb-4">{profileData.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-blue-200">Risk Score</div>
                <div className="text-2xl font-bold">{profileData.riskScore}</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">Member Since</div>
                <div className="text-lg font-medium">{profileData.membershipDate}</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">Last Login</div>
                <div className="text-lg font-medium">{profileData.lastLogin}</div>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-semibold">Verified Account</span>
            </div>
            <div className="text-sm text-blue-100">
              ID verified • Email verified • Phone verified
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    icon={UserIcon}
                  />
                  <Input
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    icon={UserIcon}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    icon={EnvelopeIcon}
                  />
                  <Input
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    icon={PhoneIcon}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                    icon={CalendarIcon}
                  />
                  <Select
                    label="Occupation"
                    value={profileData.occupation}
                    onChange={(value) => setProfileData(prev => ({ ...prev, occupation: value }))}
                    disabled={!isEditing}
                    options={[
                      'Software Engineer',
                      'Doctor',
                      'Teacher',
                      'Business Owner',
                      'Manager',
                      'Other'
                    ].map(occ => ({ value: occ, label: occ }))}
                  />
                  <Input
                    label="Annual Income"
                    value={profileData.annualIncome}
                    onChange={(e) => setProfileData(prev => ({ ...prev, annualIncome: e.target.value }))}
                    disabled={!isEditing}
                    icon={CreditCardIcon}
                  />
                  <Input
                    label="Address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    icon={MapPinIcon}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Biometric Login
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Use fingerprint or face recognition
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.biometricLogin}
                      onChange={(checked) => handleSecurityChange('biometricLogin', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Login Alerts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about new logins
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onChange={(checked) => handleSecurityChange('loginAlerts', checked)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <Button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Change Password
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Receive important updates via email
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        SMS Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get text messages for urgent updates
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Policy Updates
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Notifications about your policies
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.policyUpdates}
                      onChange={() => handleNotificationChange('policyUpdates')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Claim Updates
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Status changes for your claims
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.claimUpdates}
                      onChange={() => handleNotificationChange('claimUpdates')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Marketing Emails
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Product updates and promotions
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Security Alerts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Important security notifications
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.securityAlerts}
                      onChange={() => handleNotificationChange('securityAlerts')}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Default Currency"
                    value="USD"
                    options={[
                      { value: 'USD', label: 'US Dollar ($)' },
                      { value: 'EUR', label: 'Euro (€)' },
                      { value: 'GBP', label: 'British Pound (£)' },
                      { value: 'JPY', label: 'Japanese Yen (¥)' }
                    ]}
                  />

                  <Select
                    label="Language"
                    value="en"
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Spanish' },
                      { value: 'fr', label: 'French' },
                      { value: 'de', label: 'German' }
                    ]}
                  />

                  <Select
                    label="Date Format"
                    value="mm/dd/yyyy"
                    options={[
                      { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
                      { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
                      { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }
                    ]}
                  />

                  <Select
                    label="Time Zone"
                    value="est"
                    options={[
                      { value: 'est', label: 'Eastern Time (ET)' },
                      { value: 'cst', label: 'Central Time (CT)' },
                      { value: 'pst', label: 'Pacific Time (PT)' },
                      { value: 'utc', label: 'UTC' }
                    ]}
                  />
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Data Privacy
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    You can download all your personal data or request account deletion.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline">
                      Download My Data
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      Request Account Deletion
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
          />
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Update Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Photo Modal */}
      <Modal
        isOpen={isUploadPhotoOpen}
        onClose={() => setIsUploadPhotoOpen(false)}
        title="Upload Profile Photo"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <CameraIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a new profile photo
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl"
          />
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsUploadPhotoOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Upload Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardProfile;