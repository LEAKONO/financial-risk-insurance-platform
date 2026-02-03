import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import ActivityLog from '../../../components/admin/activity/ActivityLog';
import ActivityFilters from '../../../components/admin/activity/ActivityFilters';
import ActivityDetails from '../../../components/admin/activity/ActivityDetails';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';

const AdminActivity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: 'John Doe',
      action: 'login',
      entity: 'auth',
      entityId: 'USR-001',
      details: 'User logged in from new device',
      timestamp: '2024-01-25 14:30:25',
      ip: '192.168.1.1',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      id: 2,
      user: 'Jane Smith',
      action: 'create',
      entity: 'policy',
      entityId: 'POL-2024-001',
      details: 'Created new life insurance policy',
      timestamp: '2024-01-25 11:15:42',
      ip: '10.0.0.5',
      userAgent: 'Firefox 121.0'
    },
    {
      id: 3,
      user: 'Robert Johnson',
      action: 'update',
      entity: 'claim',
      entityId: 'CLM-2024-001',
      details: 'Updated claim status to approved',
      timestamp: '2024-01-25 09:45:18',
      ip: '172.16.0.8',
      userAgent: 'Safari 17.2'
    },
    {
      id: 4,
      user: 'System',
      action: 'error',
      entity: 'system',
      entityId: 'ERR-001',
      details: 'Database connection timeout',
      timestamp: '2024-01-24 22:10:33',
      ip: '127.0.0.1',
      userAgent: 'System'
    },
    {
      id: 5,
      user: 'Sarah Williams',
      action: 'delete',
      entity: 'user',
      entityId: 'USR-005',
      details: 'Deactivated user account',
      timestamp: '2024-01-24 16:20:55',
      ip: '192.168.1.100',
      userAgent: 'Edge 120.0.0.0'
    },
    {
      id: 6,
      user: 'Michael Brown',
      action: 'export',
      entity: 'report',
      entityId: 'REP-2024-001',
      details: 'Exported financial report',
      timestamp: '2024-01-24 14:05:12',
      ip: '10.0.0.12',
      userAgent: 'Chrome 120.0.0.0'
    },
    {
      id: 7,
      user: 'Emily Davis',
      action: 'view',
      entity: 'dashboard',
      entityId: 'DASH-001',
      details: 'Accessed admin dashboard',
      timestamp: '2024-01-24 10:30:45',
      ip: '172.16.0.15',
      userAgent: 'Firefox 121.0'
    },
    {
      id: 8,
      user: 'System',
      action: 'backup',
      entity: 'system',
      entityId: 'BACK-001',
      details: 'Completed daily backup',
      timestamp: '2024-01-24 03:00:00',
      ip: '127.0.0.1',
      userAgent: 'System'
    }
  ]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = selectedEntity === 'all' || activity.entity === selectedEntity;
    const matchesAction = selectedAction === 'all' || activity.action === selectedAction;
    const matchesUser = selectedUser === 'all' || activity.user === selectedUser;
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(activity.timestamp) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(activity.timestamp) <= new Date(endDate + ' 23:59:59');
    }
    
    return matchesSearch && matchesEntity && matchesAction && matchesUser && matchesDate;
  });

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
      setActivities([]);
    }
  };

  const handleExportLogs = () => {
    // In a real app, this would trigger a file download
    alert('Exporting activity logs...');
  };

  const entityOptions = [
    { value: 'all', label: 'All Entities' },
    { value: 'auth', label: 'Authentication' },
    { value: 'user', label: 'Users' },
    { value: 'policy', label: 'Policies' },
    { value: 'claim', label: 'Claims' },
    { value: 'system', label: 'System' },
    { value: 'report', label: 'Reports' }
  ];

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'view', label: 'View' },
    { value: 'login', label: 'Login' },
    { value: 'export', label: 'Export' },
    { value: 'error', label: 'Error' }
  ];

  const userOptions = [
    { value: 'all', label: 'All Users' },
    ...Array.from(new Set(activities.map(a => a.user))).map(user => ({
      value: user,
      label: user
    }))
  ];

  const stats = [
    { label: 'Total Activities', value: '1,247', change: '+8.5%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users Today', value: '142', change: '+12.3%', color: 'from-emerald-500 to-green-500' },
    { label: 'System Errors', value: '3', change: '-66.7%', color: 'from-red-500 to-rose-500' },
    { label: 'Avg Response Time', value: '0.4s', change: '-0.1', color: 'from-purple-500 to-pink-500' }
  ];

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return { icon: PlusIcon, color: 'text-green-600 bg-green-100 dark:bg-green-900' };
      case 'update':
        return { icon: ArrowPathIcon, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900' };
      case 'delete':
        return { icon: TrashIcon, color: 'text-red-600 bg-red-100 dark:bg-red-900' };
      case 'login':
        return { icon: UserIcon, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900' };
      case 'error':
        return { icon: ExclamationTriangleIcon, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900' };
      default:
        return { icon: EyeIcon, color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' };
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Activity Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system activities and user actions
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleExportLogs}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleClearLogs}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-5 h-5" />
            <span>Clear Logs</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              {index === 0 && <ClockIcon className="w-6 h-6 text-white" />}
              {index === 1 && <UserGroupIcon className="w-6 h-6 text-white" />}
              {index === 2 && <ExclamationTriangleIcon className="w-6 h-6 text-white" />}
              {index === 3 && <ChartBarIcon className="w-6 h-6 text-white" />}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {stat.label}
            </div>
            <div className={`inline-flex items-center text-sm font-medium ${
              stat.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {stat.change.startsWith('+') ? '↗' : '↘'} {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
      >
        <ActivityFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedEntity={selectedEntity}
          onEntityChange={setSelectedEntity}
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          entityOptions={entityOptions}
          actionOptions={actionOptions}
          userOptions={userOptions}
        />
      </motion.div>

      {/* Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <ActivityLog
          activities={filteredActivities}
          onViewDetails={handleViewDetails}
          getActionIcon={getActionIcon}
        />
      </motion.div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <ClockIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No activities found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedEntity('all');
            setSelectedAction('all');
            setSelectedUser('all');
            setStartDate('');
            setEndDate('');
          }}>
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* Activity Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Activity Details"
        size="lg"
      >
        {selectedActivity && <ActivityDetails activity={selectedActivity} />}
      </Modal>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">842</div>
              <div className="text-blue-100">User Actions</div>
            </div>
            <UserIcon className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-sm text-blue-200">
            67% login activities, 22% profile updates
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">315</div>
              <div className="text-emerald-100">Policy Activities</div>
            </div>
            <DocumentTextIcon className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-sm text-emerald-200">
            45% created, 35% updated, 20% deleted
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold">89</div>
              <div className="text-purple-100">System Events</div>
            </div>
            <ChartBarIcon className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-sm text-purple-200">
            Includes backups, errors, and maintenance
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;