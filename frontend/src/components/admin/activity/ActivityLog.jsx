import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, User, Calendar, Clock, 
  ChevronRight, AlertCircle, CheckCircle, XCircle,
  ExternalLink, Filter, RefreshCw 
} from 'lucide-react';
import { activityService } from "../../../services/api";
import { Loader, Toast, Pagination } from '../../common';
import { StatusBadge } from '@/components/ui/Badge';
import { ActivityFilters } from './ActivityFilters';

export const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchActivities();
  }, [filters, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getActivities({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setActivities(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load activities' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <CheckCircle className="text-green-500" size={18} />;
      case 'update': return <AlertCircle className="text-yellow-500" size={18} />;
      case 'delete': return <XCircle className="text-red-500" size={18} />;
      case 'login': return <Activity className="text-blue-500" size={18} />;
      default: return <Activity className="text-gray-500" size={18} />;
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
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">Monitor all system activities and user actions</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <ActivityFilters onFilterChange={handleFilterChange} loading={loading} />

      {/* Activity List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  User
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Entity
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Details
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Time
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12">
                      <Loader />
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      No activities found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity, index) => (
                    <motion.tr
                      key={activity.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {getActionIcon(activity.action)}
                          <span className="font-medium capitalize">
                            {activity.action}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {activity.user?.email || 'System'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.user?.role || 'System User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm inline-block capitalize">
                          {activity.entity}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 truncate">
                            {activity.description || `${activity.action} performed on ${activity.entity}`}
                          </p>
                          {activity.details && (
                            <button className="text-xs text-indigo-600 hover:text-indigo-800 mt-1">
                              View details
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={14} />
                          <span>{formatTime(activity.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={activity.severity || 'info'} />
                      </td>
                      <td className="py-4 px-6">
                        <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800">
                          <ExternalLink size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Activities"
          value={pagination.total}
          icon={<Activity className="text-blue-500" />}
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={activities.filter(a => a.user).length}
          icon={<User className="text-green-500" />}
          trend="+5%"
          color="green"
        />
        <StatCard
          title="Today's Activities"
          value={activities.filter(a => {
            const today = new Date();
            const activityDate = new Date(a.timestamp);
            return activityDate.toDateString() === today.toDateString();
          }).length}
          icon={<Calendar className="text-purple-500" />}
          trend="+8%"
          color="purple"
        />
        <StatCard
          title="High Severity"
          value={activities.filter(a => a.severity === 'high').length}
          icon={<AlertCircle className="text-red-500" />}
          trend="-3%"
          color="red"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
          {trend}
        </span>
        <span className="text-gray-500 ml-2">from last week</span>
      </div>
    </motion.div>
  );
};

export default ActivityLog;