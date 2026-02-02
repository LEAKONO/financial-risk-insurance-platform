import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, User, FileText, Clock, AlertCircle, 
  CheckCircle, XCircle, Activity, ExternalLink 
} from 'lucide-react';
import { activityService } from '../../../services/activity.service';
import { Loader, Toast } from '../../common';
import { StatusBadge } from '../../ui/Badge';

export const ActivityDetails = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivityById(id);
      setActivity(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load activity details' });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <FileText className="text-blue-500" />;
      case 'update': return <Activity className="text-yellow-500" />;
      case 'delete': return <XCircle className="text-red-500" />;
      case 'login': return <CheckCircle className="text-green-500" />;
      default: return <Activity className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) return <Loader />;
  if (!activity) return <div>Activity not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              {getActionIcon(activity.action)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Activity Details
              </h1>
              <p className="text-blue-100">Track user actions and system events</p>
            </div>
          </div>
          <StatusBadge status={activity.severity || 'info'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Activity Information</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                icon={<Activity className="text-gray-400" />}
                label="Action"
                value={activity.action}
                className="capitalize"
              />
              <DetailItem 
                icon={<FileText className="text-gray-400" />}
                label="Entity"
                value={activity.entity}
              />
              <DetailItem 
                icon={<User className="text-gray-400" />}
                label="User"
                value={activity.user?.email || 'System'}
              />
              <DetailItem 
                icon={<Calendar className="text-gray-400" />}
                label="Date & Time"
                value={formatDate(activity.timestamp)}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {activity.description || `User performed ${activity.action} on ${activity.entity}`}
              </p>
            </div>

            {activity.details && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">Additional Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(activity.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {activity.metadata && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">Metadata</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                      <div className="font-medium">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Activity Status</h3>
            <div className="space-y-3">
              <StatusItem 
                label="Severity"
                value={activity.severity}
                type="severity"
              />
              <StatusItem 
                label="Source"
                value={activity.source || 'Web Application'}
              />
              <StatusItem 
                label="IP Address"
                value={activity.ipAddress || 'N/A'}
              />
              <StatusItem 
                label="User Agent"
                value={activity.userAgent ? 'Browser Detected' : 'N/A'}
                truncate
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 p-3 rounded-lg transition-colors">
                <ExternalLink size={18} />
                <span>View Related Entity</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-50 text-gray-600 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                <User size={18} />
                <span>View User Profile</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-lg transition-colors">
                <AlertCircle size={18} />
                <span>Report Issue</span>
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              <TimelineItem 
                time={formatDate(activity.timestamp)}
                title="Activity Recorded"
                active
              />
              {activity.processedAt && (
                <TimelineItem 
                  time={formatDate(activity.processedAt)}
                  title="Processed by System"
                />
              )}
              <TimelineItem 
                time="Now"
                title="Viewing Details"
                future
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const DetailItem = ({ icon, label, value, className = '' }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className="text-gray-400">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`font-medium ${className}`}>{value}</div>
    </div>
  </div>
);

const StatusItem = ({ label, value, type = 'default', truncate = false }) => {
  const getColor = (val) => {
    if (type === 'severity') {
      switch (val) {
        case 'high': return 'text-red-600 bg-red-50';
        case 'medium': return 'text-yellow-600 bg-yellow-50';
        case 'low': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    }
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColor(value)}`}>
        {truncate && value && value.length > 20 ? `${value.substring(0, 20)}...` : value}
      </span>
    </div>
  );
};

const TimelineItem = ({ time, title, active = false, future = false }) => (
  <div className="flex items-start space-x-3">
    <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
      active ? 'bg-blue-500' : future ? 'bg-gray-300' : 'bg-gray-400'
    }`} />
    <div className="flex-1">
      <div className="font-medium text-gray-800">{title}</div>
      <div className="text-sm text-gray-500">{time}</div>
    </div>
  </div>
);

export default ActivityDetails;