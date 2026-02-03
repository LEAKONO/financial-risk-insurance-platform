import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit, Trash2, Eye, Download, Send,
  CheckCircle, XCircle, Clock, Filter,
  MoreVertical, Copy, RefreshCw, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Toast from "../../common/Toast";
export const PolicyActions = ({ policy, onAction, disabled = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [toast, setToast] = useState(null);

  const handleAction = async (action) => {
    try {
      setShowMenu(false);
      
      switch (action) {
        case 'view':
          onAction?.('view', policy);
          break;
        
        case 'edit':
          onAction?.('edit', policy);
          break;
        
        case 'renew':
          setActionType('renew');
          setShowConfirm(true);
          break;
        
        case 'cancel':
          setActionType('cancel');
          setShowConfirm(true);
          break;
        
        case 'download':
          await handleDownload();
          break;
        
        case 'copy':
          await handleCopy();
          break;
        
        case 'send':
          await handleSend();
          break;
        
        default:
          break;
      }
    } catch (error) {
      setToast({ type: 'error', message: `Failed to perform action: ${error.message}` });
    }
  };

  const handleDownload = async () => {
    setToast({ type: 'info', message: 'Downloading policy document...' });
    // Simulate download
    setTimeout(() => {
      setToast({ type: 'success', message: 'Policy document downloaded successfully!' });
    }, 1500);
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(policy.policyNumber);
    setToast({ type: 'success', message: 'Policy number copied to clipboard!' });
  };

  const handleSend = async () => {
    setToast({ type: 'info', message: 'Sending policy document...' });
    // Simulate sending
    setTimeout(() => {
      setToast({ type: 'success', message: 'Policy document sent successfully!' });
    }, 1500);
  };

  const handleConfirm = async () => {
    try {
      setShowConfirm(false);
      onAction?.(actionType, policy);
      setToast({ 
        type: 'success', 
        message: `Policy ${actionType === 'cancel' ? 'cancelled' : 'renewed'} successfully!` 
      });
    } catch (error) {
      setToast({ type: 'error', message: `Failed to ${actionType} policy` });
    }
  };

  const isActive = policy.status === 'active';
  const isExpired = policy.status === 'expired';
  const isCancelled = policy.status === 'cancelled';

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      <div className="flex items-center space-x-2">
        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('view')}
            title="View Details"
            disabled={disabled}
          >
            <Eye size={16} />
          </Button>
          
          {isActive && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('edit')}
                title="Edit Policy"
                disabled={disabled}
              >
                <Edit size={16} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('renew')}
                title="Renew Policy"
                disabled={disabled}
              >
                <RefreshCw size={16} />
              </Button>
            </>
          )}
          
          {isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('download')}
              title="Download Document"
              disabled={disabled}
            >
              <Download size={16} />
            </Button>
          )}
        </div>

        {/* More Actions Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            disabled={disabled}
          >
            <MoreVertical size={16} />
          </Button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
            >
              <div className="py-1">
                <MenuItem
                  icon={<Eye size={16} />}
                  label="View Details"
                  onClick={() => handleAction('view')}
                />
                
                {isActive && (
                  <MenuItem
                    icon={<Edit size={16} />}
                    label="Edit Policy"
                    onClick={() => handleAction('edit')}
                  />
                )}
                
                <MenuItem
                  icon={<Copy size={16} />}
                  label="Copy Policy Number"
                  onClick={() => handleAction('copy')}
                />
                
                <MenuItem
                  icon={<Download size={16} />}
                  label="Download Document"
                  onClick={() => handleAction('download')}
                />
                
                <MenuItem
                  icon={<Send size={16} />}
                  label="Send to Email"
                  onClick={() => handleAction('send')}
                />
                
                {isActive && (
                  <MenuItem
                    icon={<RefreshCw size={16} />}
                    label="Renew Policy"
                    onClick={() => handleAction('renew')}
                  />
                )}
                
                {isActive && (
                  <MenuItem
                    icon={<Ban size={16} />}
                    label="Cancel Policy"
                    onClick={() => handleAction('cancel')}
                    danger
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              {actionType === 'cancel' ? (
                <XCircle className="text-red-500" size={32} />
              ) : (
                <CheckCircle className="text-green-500" size={32} />
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {actionType === 'cancel' ? 'Cancel Policy' : 'Renew Policy'}
                </h3>
                <p className="text-gray-600">Policy #{policy.policyNumber}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              {actionType === 'cancel'
                ? 'Are you sure you want to cancel this policy? This action cannot be undone.'
                : 'Do you want to renew this policy for another term?'}
            </p>

            {actionType === 'cancel' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700 mb-2">
                  <AlertCircle size={16} />
                  <span className="font-semibold">Warning</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• All coverage will be terminated immediately</li>
                  <li>• Any pending claims will be cancelled</li>
                  <li>• Refunds may be subject to cancellation fees</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant={actionType === 'cancel' ? 'danger' : 'primary'}
                fullWidth
                onClick={handleConfirm}
              >
                {actionType === 'cancel' ? (
                  <>
                    <Ban size={18} />
                    Confirm Cancellation
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirm Renewal
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

const MenuItem = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
      danger ? 'text-red-600 hover:text-red-800' : 'text-gray-700 hover:text-gray-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Import missing icon
const AlertCircle = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default PolicyActions;