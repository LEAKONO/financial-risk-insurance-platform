import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import UserTable from '../../../components/admin/users/UserTable';
import UserDetails from '../../../components/admin/users/UserDetails';
import UserForm from '../../../components/admin/users/UserForm';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Form/Input';
import Select from '../../../components/ui/Form/Select';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'customer',
      status: 'active',
      phone: '+1 (555) 123-4567',
      joinDate: '2023-01-15',
      policies: 3,
      lastLogin: '2024-01-25 14:30'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'admin',
      status: 'active',
      phone: '+1 (555) 987-6543',
      joinDate: '2022-11-20',
      policies: 5,
      lastLogin: '2024-01-25 09:15'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      role: 'underwriter',
      status: 'active',
      phone: '+1 (555) 456-7890',
      joinDate: '2023-03-10',
      policies: 12,
      lastLogin: '2024-01-24 16:45'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      role: 'customer',
      status: 'inactive',
      phone: '+1 (555) 234-5678',
      joinDate: '2023-05-05',
      policies: 1,
      lastLogin: '2024-01-20 11:20'
    },
    {
      id: 5,
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      role: 'customer',
      status: 'pending',
      phone: '+1 (555) 345-6789',
      joinDate: '2024-01-10',
      policies: 0,
      lastLogin: '2024-01-10 08:00'
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      role: 'customer',
      status: 'active',
      phone: '+1 (555) 567-8901',
      joinDate: '2023-08-15',
      policies: 2,
      lastLogin: '2024-01-25 10:30'
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      policies: 0
    };
    setUsers([...users, newUser]);
    setIsFormOpen(false);
  };

  const handleUpdateUser = (updatedData) => {
    setUsers(users.map(user => 
      user.id === selectedUser.id ? { ...user, ...updatedData } : user
    ));
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'underwriter', label: 'Underwriter' },
    { value: 'customer', label: 'Customer' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12.5%', color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users', value: '2,415', change: '+8.2%', color: 'from-emerald-500 to-green-500' },
    { label: 'New This Month', value: '284', change: '+15.3%', color: 'from-purple-500 to-pink-500' },
    { label: 'Avg Policies/User', value: '2.3', change: '+0.4', color: 'from-orange-500 to-yellow-500' }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and permissions
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Export</span>
          </Button>
          <Button
            onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Add User</span>
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
              <UserGroupIcon className="w-6 h-6 text-white" />
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

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-96"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
              className="w-40"
            />

            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              className="w-40"
            />

            <Button variant="outline" className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5" />
              <span>More Filters</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <UserTable
          users={filteredUsers}
          onViewDetails={handleViewDetails}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </motion.div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <UserGroupIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button onClick={() => { setSearchTerm(''); setSelectedRole('all'); setSelectedStatus('all'); }}>
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && <UserDetails user={selectedUser} />}
      </Modal>

      {/* User Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedUser(null); }}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
          onCancel={() => { setIsFormOpen(false); setSelectedUser(null); }}
        />
      </Modal>
    </div>
  );
};

export default AdminUsers;