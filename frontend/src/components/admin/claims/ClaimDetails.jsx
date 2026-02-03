import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, User, Calendar, DollarSign, AlertCircle,
  CheckCircle, XCircle, Clock, Download, MessageSquare,
  ExternalLink, ChevronLeft, Edit, Trash2, Shield,
  MapPin, Phone, Mail, Home, Car, Heart, AlertTriangle,
  Upload, Eye, FileCheck, Users, TrendingUp, BarChart,
  ChevronRight, Printer, Share2, Bookmark, Bell
} from 'lucide-react';
import { claimService } from "../../../services/api";
import { Loader, Toast } from '../../common';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const data = await claimService.getClaimById(id);
      setClaim(data);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load claim details' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await claimService.updateClaimStatus(id, { status: newStatus });
      setToast({ type: 'success', message: `Claim status updated to ${newStatus}` });
      fetchClaim();
      setShowStatusModal(false);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update status' });
    }
  };

  const handleAssign = async () => {
    try {
      await claimService.assignClaim(id, { assignedTo: 'current-user-id' });
      setToast({ type: 'success', message: 'Claim assigned successfully' });
      fetchClaim();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to assign claim' });
    }
  };

  const handleDelete = async () => {
    try {
      await claimService.deleteClaim(id);
      setToast({ type: 'success', message: 'Claim deleted successfully' });
      navigate('/admin/claims');
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete claim' });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      accident: Car,
      illness: Heart,
      'property-damage': Home,
      theft: Shield,
      liability: AlertTriangle,
      disability: User,
      death: XCircle,
      other: FileText
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusIcon = (status) => {
    const icons = {
      submitted: Clock,
      'under-review': AlertCircle,
      'documentation-required': FileText,
      approved: CheckCircle,
      rejected: XCircle,
      paid: DollarSign,
      closed: CheckCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-5 h-5" />;
  };

  const getTimelineEvents = () => {
    const events = [
      {
        date: claim.createdAt,
        title: 'Claim Submitted',
        description: 'Claim was submitted for review',
        status: 'completed',
        icon: FileText
      }
    ];

    if (claim.assignedTo) {
      events.push({
        date: claim.assignedDate || claim.createdAt,
        title: 'Assigned to Adjuster',
        description: `Assigned to ${claim.assignedTo.name}`,
        status: 'completed',
        icon: User
      });
    }

    if (claim.reviewDate) {
      events.push({
        date: claim.reviewDate,
        title: 'Under Review',
        description: 'Claim entered review process',
        status: 'completed',
        icon: AlertCircle
      });
    }

    if (claim.approvalDate) {
      events.push({
        date: claim.approvalDate,
        title: claim.status === 'rejected' ? 'Claim Rejected' : 'Claim Approved',
        description: claim.status === 'rejected' 
          ? (claim.rejectionReason || 'Claim rejected')
          : `Approved amount: ${formatCurrency(claim.approvedAmount)}`,
        status: 'completed',
        icon: claim.status === 'rejected' ? XCircle : CheckCircle
      });
    }

    if (claim.paymentDate) {
      events.push({
        date: claim.paymentDate,
        title: 'Payment Processed',
        description: `Payment of ${formatCurrency(claim.paidAmount)} sent`,
        status: 'completed',
        icon: DollarSign
      });
    }

    if (claim.closedDate) {
      events.push({
        date: claim.closedDate,
        title: 'Claim Closed',
        description: 'Claim process completed',
        status: 'completed',
        icon: CheckCircle
      });
    }

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const DetailItem = ({ icon, label, value, children }) => (
    <div className="space-y-1">
      <div className="flex items-center space-x-2 text-gray-600">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children || <div className="text-gray-900 font-semibold">{value || 'N/A'}</div>}
    </div>
  );

  const ActionButton = ({ icon, label, onClick, variant = 'outline', color = 'gray' }) => (
    <Button
      variant={variant}
      onClick={onClick}
      className={`flex items-center space-x-2 ${
        color === 'red' ? 'text-red-600 hover:bg-red-50' :
        color === 'green' ? 'text-green-600 hover:bg-green-50' :
        color === 'blue' ? 'text-blue-600 hover:bg-blue-50' :
        'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );

  if (loading) return <Loader />;
  if (!claim) return <div className="text-center py-12">Claim not found</div>;

  const timelineEvents = getTimelineEvents();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/claims')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
        >
          <ChevronLeft size={20} />
          <span>Back to Claims</span>
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Claim Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Claim #{claim.claimNumber || id} • {formatDate(claim.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={claim.status} />
            <PriorityBadge priority={claim.priority || 'medium'} />
            <div className="hidden lg:flex items-center space-x-2">
              <ActionButton
                icon={<Edit size={16} />}
                label="Edit"
                onClick={() => navigate(`/admin/claims/${id}/edit`)}
              />
              <ActionButton
                icon={<Printer size={16} />}
                label="Print"
                onClick={() => window.print()}
              />
              <ActionButton
                icon={<Share2 size={16} />}
                label="Share"
                onClick={() => {/* Share functionality */}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'documents', label: 'Documents' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'communications', label: 'Communications' },
            { id: 'analysis', label: 'Analysis' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Claim Information */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Claim Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem 
                    icon={getTypeIcon(claim.type)}
                    label="Claim Type"
                    value={claim.type?.replace('-', ' ').toUpperCase()}
                  />
                  <DetailItem 
                    icon={<Calendar className="text-green-500" />}
                    label="Incident Date"
                    value={formatDate(claim.incidentDate)}
                  />
                  <DetailItem 
                    icon={<DollarSign className="text-blue-500" />}
                    label="Claim Amount"
                    value={formatCurrency(claim.claimedAmount)}
                  />
                  <DetailItem 
                    icon={<DollarSign className="text-green-500" />}
                    label="Approved Amount"
                    value={claim.approvedAmount ? formatCurrency(claim.approvedAmount) : 'Pending'}
                  />
                  <DetailItem 
                    icon={<Shield className="text-purple-500" />}
                    label="Policy"
                    value={claim.policy?.policyNumber || 'N/A'}
                  />
                  <DetailItem 
                    icon={<User className="text-orange-500" />}
                    label="Assigned To"
                    value={claim.assignedTo?.name || 'Unassigned'}
                  />
                </div>

                {/* Description */}
                {claim.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {claim.description}
                    </p>
                  </div>
                )}

                {/* Location */}
                {claim.location && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Location</h3>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{claim.location}</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Contact Information */}
              {claim.contactInfo && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem 
                      icon={<User className="text-blue-500" />}
                      label="Claimant"
                      value={claim.contactInfo.name}
                    />
                    <DetailItem 
                      icon={<Phone className="text-green-500" />}
                      label="Phone"
                      value={claim.contactInfo.phone}
                    />
                    <DetailItem 
                      icon={<Mail className="text-purple-500" />}
                      label="Email"
                      value={claim.contactInfo.email}
                    />
                    <DetailItem 
                      icon={<MapPin className="text-orange-500" />}
                      label="Address"
                      value={claim.contactInfo.address}
                    />
                  </div>
                </Card>
              )}

              {/* Fraud Indicators */}
              {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                <Card className="p-6 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Fraud Indicators Detected
                      </h3>
                      <div className="space-y-2">
                        {claim.fraudIndicators.map((indicator, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Documents</h2>
                <Button
                  variant="primary"
                  onClick={() => setShowDocumentModal(true)}
                >
                  <Upload size={16} className="mr-2" />
                  Upload Document
                </Button>
              </div>
              
              {claim.documents && claim.documents.length > 0 ? (
                <div className="space-y-4">
                  {claim.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {doc.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {doc.type} • {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <Eye size={16} className="mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Documents
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No documents have been uploaded for this claim yet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowDocumentModal(true)}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload First Document
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Claim Timeline
              </h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="space-y-8">
                  {timelineEvents.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start space-x-4"
                    >
                      <div className={`
                        relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center
                        ${event.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-blue-100 dark:bg-blue-900/30'
                        }
                      `}>
                        <event.icon className={`
                          w-6 h-6
                          ${event.status === 'completed' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-blue-600 dark:text-blue-400'
                          }
                        `} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(event.date)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                        {event.note && (
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {event.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowStatusModal(true)}
              >
                <CheckCircle size={16} className="mr-2" />
                Update Status
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAssign}
              >
                <Users size={16} className="mr-2" />
                {claim.assignedTo ? 'Reassign Claim' : 'Assign Claim'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/admin/claims/${id}/edit`)}
              >
                <Edit size={16} className="mr-2" />
                Edit Claim
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} className="mr-2" />
                Delete Claim
              </Button>
            </div>
          </Card>

          {/* Status History */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Status History
            </h3>
            <div className="space-y-3">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(claim.status)}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{event.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(event.date)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Dates */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Key Dates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Submitted</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(claim.createdAt)}
                </span>
              </div>
              {claim.incidentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Incident Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(claim.incidentDate)}
                  </span>
                </div>
              )}
              {claim.reviewDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Review Started</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(claim.reviewDate)}
                  </span>
                </div>
              )}
              {claim.approvalDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Decision Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(claim.approvalDate)}
                  </span>
                </div>
              )}
              {claim.paymentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(claim.paymentDate)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Financial Summary */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Claimed Amount</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(claim.claimedAmount)}
                </span>
              </div>
              {claim.approvedAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Approved Amount</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(claim.approvedAmount)}
                  </span>
                </div>
              )}
              {claim.paidAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Paid Amount</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(claim.paidAmount)}
                  </span>
                </div>
              )}
              {claim.deductible && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Deductible</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(claim.deductible)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Related Links */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Related Links
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Policy Details</span>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Customer Profile</span>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Similar Claims</span>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <span className="text-sm">Generate Report</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Claim Status"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select the new status for this claim:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {['submitted', 'under-review', 'documentation-required', 'approved', 'rejected', 'paid', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  claim.status === status
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="capitalize">{status.replace('-', ' ')}</span>
                </div>
              </button>
            ))}
          </div>
          {claim.status === 'rejected' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rejection Reason
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Claim"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
            <AlertCircle size={24} />
            <p className="font-medium">Are you sure you want to delete this claim?</p>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. All claim data, including documents and history, will be permanently deleted.
          </p>
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete Claim
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument.name}
          size="lg"
        >
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              {selectedDocument.type?.startsWith('image/') ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <FileText className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Type: {selectedDocument.type || 'Unknown'}</span>
              <span>Size: {selectedDocument.size ? `${(selectedDocument.size / 1024).toFixed(1)} KB` : 'Unknown'}</span>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => window.open(selectedDocument.url, '_blank')}
                className="flex-1"
              >
                <ExternalLink size={16} className="mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedDocument.url;
                  link.download = selectedDocument.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex-1"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Mobile Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/admin/claims/${id}/edit`)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowStatusModal(true)}
          >
            <CheckCircle size={16} />
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.print()}
          >
            <Printer size={16} />
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};export default ClaimDetails;
