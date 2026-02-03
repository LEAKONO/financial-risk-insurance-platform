import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, UserPlus,
  ChevronUp, ChevronDown,
  Users, CheckCircle, Clock,
  AlertCircle, XCircle, Eye,
  Mail, Phone, Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Form/Input';
import { Select } from '@/components/ui/Form/Select';
import { Badge } from '@/components/ui/Badge/Badge';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { UserActions } from './UserActions';

export const UserTable = ({ users: initialUsers = [], onAddUser, onEditUser, onDeleteUser }) => {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockUsers = [
        {
          id: 'USR001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          role: 'customer',
          status: 'active',
          joinedDate: '2023-01-15',
          lastLogin: '2024-01-20T10:30:00Z',
          totalPolicies: 3,
          totalClaims: 2
        },
        {
          id: 'USR002',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 987-6543',
          role: 'agent',
          status: 'active',
          joinedDate: '2022-08-22',
          lastLogin: '2024-01-19T14:45:00Z',
          totalPolicies: 15,
          totalClaims: 8
        },
        {
          id: 'USR003',
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1 (555) 456-7890',
          role: 'customer',
          status: 'inactive',
          joinedDate: '2023-05-10',
          lastLogin: '2023-12-05T09:15:00Z',
          totalPolicies: 1,
          totalClaims: 0
        },
        {
          id: 'USR004',
          name: 'Alice Williams',
          email: 'alice.williams@example.com',
          phone: '+1 (555) 789-0123',
          role: 'admin',
          status: 'active',
          joinedDate: '2022-03-18',
          lastLogin: '2024-01-21T08:20:00Z',
          totalPolicies: 25,
          totalClaims: 12
        },
        {
          id: 'USR005',
          name: 'Charlie Brown',
          email: 'charlie.brown@example.com',
          phone: '+1 (555) 321-0987',
          role: 'customer',
          status: 'pending',
          joinedDate: '2024-01-05',
          lastLogin: null,
          totalPolicies: 0,
          totalClaims: 0
        }
      ];

      // Apply filters
      let filtered = [...mockUsers];
      
      if (searchTerm) {
        filtered = filtered.filter(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
        );
      }
      
      if (filters.status !== 'all') {
        filtered = filtered.filter(user => user.status === filters.status);
      }
      
      if (filters.role !== 'all') {
        filtered = filtered.filter(user => user.role === filters.role);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        
        switch (filters.sortBy) {
          case 'name':
            return order * a.name.localeCompare(b.name);
          case 'joinedDate':
            return order * (new Date(a.joinedDate) - new Date(b.joinedDate));
          case 'lastLogin':
            return order * (new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0));
          default:
            return 0;
        }
      });

      // Apply pagination
      const start = (pagination.page - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginated = filtered.slice(start, end);

      setUsers(paginated);
      setPagination(prev => ({
        ...prev,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pagination.pageSize)
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} dark:bg-gray-800 dark:text-gray-300`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800' },
      customer: { color: 'bg-blue-100 text-blue-800' },
      agent: { color: 'bg-green-100 text-green-800' },
      support: { color: 'bg-orange-100 text-orange-800' }
    };
    const config = roleConfig[role] || roleConfig.customer;
    
    return (
      <Badge className={`${config.color} dark:bg-gray-800 dark:text-gray-300`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never logged in';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
          >
            <span className="sr-only">Refresh</span>
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={onAddUser}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'suspended', label: 'Suspended' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <Select
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'customer', label: 'Customer' },
                { value: 'agent', label: 'Agent' },
                { value: 'admin', label: 'Admin' },
                { value: 'support', label: 'Support' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <Select
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'joinedDate', label: 'Joined Date' },
                { value: 'lastLogin', label: 'Last Login' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Selected Users Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500 text-white">
                {selectedUsers.length} selected
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">
                Users selected for bulk actions
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Bulk activate */}}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Bulk deactivate */}}
              >
                <Clock className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    User
                    {filters.sortBy === 'name' && (
                      filters.sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('joinedDate')}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Joined Date
                    {filters.sortBy === 'joinedDate' && (
                      filters.sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('lastLogin')}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Last Login
                    {filters.sortBy === 'lastLogin' && (
                      filters.sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No users found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm || filters.status !== 'all' || filters.role !== 'all'
                        ? 'Try changing your filters'
                        : 'No users have been added yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(user.joinedDate)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatRelativeTime(user.lastLogin)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* View details */}}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <UserActions
                          user={user}
                          onEdit={onEditUser}
                          onDelete={onDeleteUser}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {users.length} of {pagination.total} users
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Users per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => setPagination(prev => ({
                    ...prev,
                    pageSize: parseInt(e.target.value),
                    page: 1
                  }))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pagination.total}
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Users</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'pending').length}
              </div>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Policies/User</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(users.reduce((sum, user) => sum + user.totalPolicies, 0) / users.length).toFixed(1)}
              </div>
            </div>
            <Filter className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>
    </div>
  );
};export default UserTable;
