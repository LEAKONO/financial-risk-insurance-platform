import React, { useState } from 'react';
import {
  MoreVertical, Edit, Trash2, UserCheck,
  UserX, Mail, Phone, Lock,
  Eye, Download, Ban, CheckCircle,
  XCircle, Clock, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Badge } from '@/components/ui/Badge/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export const UserActions = ({ user, onEdit, onDelete, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    switch (action) {
      case 'edit':
        onEdit?.(user);
        break;
      case 'delete':
        setActionType('delete');
        setShowConfirm(true);
        break;
      case 'activate':
        await changeStatus('active');
        break;
      case 'deactivate':
        setActionType('deactivate');
        setShowConfirm(true);
        break;
      case 'suspend':
        setActionType('suspend');
        setShowConfirm(true);
        break;
      case 'reset':
        await resetPassword();
        break;
      case 'view':
        // Navigate to user details
        break;
      case 'export':
        await exportUserData();
        break;
      default:
        break;
    }
    setShowActions(false);
  };

  const changeStatus = async (status) => {
    setLoading(true);
    try {
      await onStatusChange?.(user.id, status);
    } catch (error) {
      console.error('Failed to change user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      // API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password reset email sent to user');
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    setLoading(true);
    try {
      // API call to export user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('User data exported successfully');
    } catch (error) {
      console.error('Failed to export user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async () => {
    setLoading(true);
    try {
      if (actionType === 'delete') {
        await onDelete?.(user.id);
      } else if (actionType === 'deactivate') {
        await changeStatus('inactive');
      } else if (actionType === 'suspend') {
        await changeStatus('suspended');
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setActionType(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-800', icon: Ban },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
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

  const getActionItems = () => {
    const baseItems = [
      {
        id: 'view',
        label: 'View Details',
        icon: Eye,
        color: 'text-blue-600'
      },
      {
        id: 'edit',
        label: 'Edit User',
        icon: Edit,
        color: 'text-green-600'
      },
      {
        id: 'reset',
        label: 'Reset Password',
        icon: Lock,
        color: 'text-purple-600'
      }
    ];

    const statusItems = user.status === 'active' 
      ? [
          {
            id: 'deactivate',
            label: 'Deactivate User',
            icon: UserX,
            color: 'text-yellow-600'
          },
          {
            id: 'suspend',
            label: 'Suspend User',
            icon: Ban,
            color: 'text-red-600'
          }
        ]
      : [
          {
            id: 'activate',
            label: 'Activate User',
            icon: UserCheck,
            color: 'text-green-600'
          }
        ];

    const exportItem = {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      color: 'text-indigo-600'
    };

    const deleteItem = {
      id: 'delete',
      label: 'Delete User',
      icon: Trash2,
      color: 'text-red-600'
    };

    return [...baseItems, ...statusItems, exportItem, deleteItem];
  };

  const getConfirmMessage = () => {
    switch (actionType) {
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
          confirmText: 'Delete User',
          confirmColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'deactivate':
        return {
          title: 'Deactivate User',
          message: `Are you sure you want to deactivate ${user.name}? They will no longer be able to access the system.`,
          confirmText: 'Deactivate',
          confirmColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'suspend':
        return {
          title: 'Suspend User',
          message: `Are you sure you want to suspend ${user.name}? Their account will be temporarily disabled.`,
          confirmText: 'Suspend User',
          confirmColor: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to perform this action?',
          confirmText: 'Confirm',
          confirmColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
            >
              <div className="p-2">
                {/* User Info Header */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(user.status)}
                  </div>
                </div>

                {/* Action Items */}
                <div className="py-1">
                  {getActionItems().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAction(item.id)}
                      disabled={loading}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm
                        hover:bg-gray-100 dark:hover:bg-gray-700 rounded
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${item.color}
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const confirm = getConfirmMessage();
                return (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {confirm.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {confirm.message}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {actionType === 'delete' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="text-sm text-red-700 dark:text-red-400">
                              Warning: This will permanently delete all user data, including policies, claims, and activity history.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirm(false)}
                          disabled={loading}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={confirmAction}
                          disabled={loading}
                          className={`flex-1 ${confirm.confirmColor}`}
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            confirm.confirmText
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};