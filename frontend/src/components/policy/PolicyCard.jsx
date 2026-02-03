import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Calendar, DollarSign, Clock, 
  AlertCircle, CheckCircle, XCircle, MoreVertical,
  FileText, Users, TrendingUp, Heart, Home, Car, Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button/Button';
import { formatDate, formatCurrency } from '@/utils/formatters';

const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  expired: { color: 'bg-gray-100 text-gray-800', icon: Clock },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
  lapsed: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  draft: { color: 'bg-blue-100 text-blue-800', icon: FileText }
};

const typeConfig = {
  life: { color: 'bg-red-500', icon: Users },
  health: { color: 'bg-green-500', icon: Heart },
  property: { color: 'bg-blue-500', icon: Home },
  auto: { color: 'bg-purple-500', icon: Car },
  disability: { color: 'bg-amber-500', icon: Briefcase }
};

export const PolicyCard = ({ policy, onView, onEdit, onRenew, onCancel, className = '' }) => {
  const StatusIcon = statusConfig[policy.status]?.icon || AlertCircle;
  const TypeIcon = typeConfig[policy.type]?.icon || Shield;

  const getDaysRemaining = () => {
    if (policy.status !== 'active') return 0;
    const endDate = new Date(policy.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${typeConfig[policy.type]?.color || 'bg-blue-500'} p-3 rounded-lg`}>
              <TypeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {policy.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Policy #{policy.policyNumber}
              </p>
            </div>
          </div>
          
          <Badge className={statusConfig[policy.status]?.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
          </Badge>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {policy.description || 'Insurance policy coverage'}
        </p>

        {/* Coverage Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Coverage</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(policy.totalCoverage)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Premium</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(policy.totalPremium)}/year
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Valid Until</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(policy.endDate)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Days Left</span>
            </div>
            <p className={`text-lg font-semibold ${
              daysRemaining < 30 ? 'text-red-600' : 'text-gray-900 dark:text-white'
            }`}>
              {daysRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Risk Indicator */}
      {policy.riskScore && (
        <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${policy.riskScore}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full ${
                    policy.riskScore < 30 ? 'bg-green-500' :
                    policy.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <span className={`font-semibold ${
                policy.riskScore < 30 ? 'text-green-600' :
                policy.riskScore < 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {policy.riskScore}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(policy)}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              View Details
            </Button>
            {policy.status === 'active' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(policy)}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRenew?.(policy)}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Renew
                </Button>
              </>
            )}
            {policy.status === 'active' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel?.(policy)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Cancel
              </Button>
            )}
          </div>

          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PolicyCard;