import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  ChevronRight,
  Eye,
  Download,
  MoreVertical,
  ExternalLink,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';
import { formatCurrency, formatDate, getDaysAgo } from '../../../utils/formatters';

export const ClaimCard = ({ 
  claim, 
  onClick, 
  showActions = true,
  compact = false,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      'submitted': { 
        icon: Clock, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-50',
        label: 'Submitted'
      },
      'under-review': { 
        icon: AlertCircle, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        label: 'Under Review'
      },
      'approved': { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        label: 'Approved'
      },
      'rejected': { 
        icon: XCircle, 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        label: 'Rejected'
      },
      'paid': { 
        icon: DollarSign, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50',
        label: 'Paid'
      },
      'documentation-required': { 
        icon: FileText, 
        color: 'text-orange-600', 
        bg: 'bg-orange-50',
        label: 'Docs Required'
      },
      'closed': { 
        icon: Shield, 
        color: 'text-gray-600', 
        bg: 'bg-gray-50',
        label: 'Closed'
      }
    };
    return configs[status] || configs.submitted;
  };

  const getClaimTypeIcon = (type) => {
    const icons = {
      'accident': '🚗',
      'illness': '🏥',
      'property-damage': '🏠',
      'theft': '👮',
      'liability': '⚖️',
      'disability': '♿',
      'death': '⚰️',
      'other': '📄'
    };
    return icons[type] || icons.other;
  };

  const statusConfig = getStatusConfig(claim.status);
  const StatusIcon = statusConfig.icon;
  const daysAgo = getDaysAgo(claim.submittedDate || claim.createdAt);

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    setShowActionMenu(false);
    if (action === 'view' && onClick) {
      onClick(claim);
    }
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => onClick && onClick(claim)}
        className={`bg-white border border-gray-200 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getClaimTypeIcon(claim.type)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">{claim.claimNumber}</h4>
                <Badge variant={claim.status === 'approved' ? 'success' : 
                               claim.status === 'rejected' ? 'danger' : 
                               claim.status === 'paid' ? 'primary' : 'warning'}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                {claim.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(claim.claimedAmount)}
              </div>
              <div className="text-sm text-gray-500">
                {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isHovered ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="text-gray-400" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      onClick={() => onClick && onClick(claim)}
    >
      {/* Gradient border effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 -m-0.5 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
              <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-gray-900">{claim.claimNumber}</h3>
                <span className="text-2xl" role="img" aria-label={claim.type}>
                  {getClaimTypeIcon(claim.type)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{claim.type.replace('-', ' ').toUpperCase()}</p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowActionMenu(!showActionMenu);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreVertical size={20} />
            </Button>

            <AnimatePresence>
              {showActionMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      onClick={(e) => handleActionClick(e, 'view')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={(e) => handleActionClick(e, 'download')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Download Documents</span>
                    </button>
                    <button
                      onClick={(e) => handleActionClick(e, 'external')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <ExternalLink size={16} />
                      <span>Open in New Tab</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6 line-clamp-2">
          {claim.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="text-gray-500" size={18} />
              <div className="text-sm text-gray-600">Claimed Amount</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(claim.claimedAmount)}
            </div>
          </div>

          {claim.approvedAmount && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-blue-500" size={18} />
                <div className="text-sm text-blue-600">Approved Amount</div>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(claim.approvedAmount)}
              </div>
            </div>
          )}

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="text-amber-500" size={18} />
              <div className="text-sm text-amber-600">Incident Date</div>
            </div>
            <div className="text-lg font-bold text-amber-700">
              {formatDate(claim.incidentDate)}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="text-purple-500" size={18} />
              <div className="text-sm text-purple-600">Days Since</div>
            </div>
            <div className="text-lg font-bold text-purple-700">
              {daysAgo} days
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={16} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {claim.policy?.policyNumber || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Policy Number</div>
              </div>
            </div>

            {claim.assignee && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="text-green-600" size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {claim.assignee.name}
                  </div>
                  <div className="text-xs text-gray-500">Assigned To</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick && onClick(claim);
                  }}
                  className="flex items-center space-x-1"
                >
                  <Eye size={16} />
                  <span>View</span>
                </Button>
                <motion.div
                  animate={{ x: isHovered ? 0 : 5, opacity: isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick && onClick(claim);
                    }}
                    className="flex items-center space-x-1"
                  >
                    <span>Details</span>
                    <ChevronRight size={16} />
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Progress indicator for certain statuses */}
        {(claim.status === 'under-review' || claim.status === 'documentation-required') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Progress</div>
              <div className="text-sm text-gray-500">Estimated completion: 3-5 days</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: claim.status === 'under-review' ? '60%' : '30%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-2 rounded-full ${
                  claim.status === 'under-review' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* Fraud indicator if present */}
        {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={18} />
              <span className="text-sm font-medium text-red-700">
                {claim.fraudIndicators.length} fraud indicator(s) detected
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Loading skeleton
export const ClaimCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
            
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <div className="w-20 h-9 bg-gray-200 rounded"></div>
                <div className="w-24 h-9 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default ClaimCard;