import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, User, FileText, CheckCircle,
  XCircle, AlertCircle, Clock, MoreVertical,
  ExternalLink, Filter, RefreshCw
} from 'lucide-react';
import { activityService } from "../../../services/api";
import { Loader, Toast } from '../../common';
import { StatusBadge } from '@/components/ui/Badge';

export const RecentActivity = ({ limit = 10, showHeader = true, showFilters = true }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Set up auto-refresh if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filter, autoRefresh]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getRecentActivities(limit, filter !== 'all' ? filter : undefined);
      setActivities(response);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load recent activities' });
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: 'all', label: 'All Activities' },
    { value: 'user', label: 'User Actions' },
    { value: 'policy', label: 'Policy Updates' },
    { value: 'claim', label: 'Claim Activities' },
    { value: 'system', label: 'System Events' }
  ];

  const getActivityIcon = (action, entity) => {
    switch (action) {
      case 'create':
        return <FileText className="text-green-500" size={16} />;
      case 'update':
        return <Activity className="text-blue-500" size={16} />;
      case 'delete':
        return <XCircle className="text-red-500" size={16} />;
      case 'login':
        return <CheckCircle className="text-purple-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        switch (entity) {
          case 'user': return <User className="text-indigo-500" size={16} />;
          case 'policy': return <FileText className="text-emerald-500" size={16} />;
          case 'claim': return <AlertCircle className="text-amber-500" size={16} />;
          default: return <Activity className="text-gray-500" size={16} />;
        }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleRefresh = () => {
    fetchActivities();
    setToast({ type: 'info', message: 'Refreshing activities...' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Activity className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-gray-600">Latest system and user activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-colors ${
                loading ? 'text-indigo-600 animate-spin' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm text-gray-600">Auto-refresh</span>
            </label>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {filters.map((filterItem) => (
              <button
                key={filterItem.value}
                onClick={() => setFilter(filterItem.value)}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === filterItem.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterItem.label}
              </button>
            ))}
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500">No activities found</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {getActivityIcon(activity.action, activity.entity)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 capitalize">
                        {activity.action}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600 capitalize">
                        {activity.entity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={activity.severity || 'info'} size="sm" />
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{formatTime(activity.timestamp)}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {activity.description || 
                      `${activity.user?.name || 'System'} performed ${activity.action} on ${activity.entity}`}
                  </p>

                  {/* Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {activity.user && (
                        <div className="flex items-center space-x-2">
                          <User size={14} />
                          <span>{activity.user.name || activity.user.email}</span>
                        </div>
                      )}
                      {activity.entityId && (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            ID: {activity.entityId.substring(0, 8)}...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm">
                        <ExternalLink size={14} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Menu */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem
            label="Total Activities"
            value={activities.length}
            icon={<Activity className="text-blue-500" />}
          />
          <StatItem
            label="User Actions"
            value={activities.filter(a => a.entity === 'user').length}
            icon={<User className="text-green-500" />}
          />
          <StatItem
            label="Policy Updates"
            value={activities.filter(a => a.entity === 'policy').length}
            icon={<FileText className="text-purple-500" />}
          />
          <StatItem
            label="High Priority"
            value={activities.filter(a => a.severity === 'high').length}
            icon={<AlertCircle className="text-red-500" />}
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatItem = ({ label, value, icon }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-gray-100 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default RecentActivity;