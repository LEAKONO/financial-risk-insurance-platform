import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, AlertCircle, FileText,
  DollarSign, XCircle, User, MessageSquare,
  Phone, Mail, Calendar, ExternalLink,
  ChevronRight, Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Progress } from '@/components/ui/Progress/Progress';
import { useToast } from '@/hooks/useToast';
import { claimService } from '@/services/claim.service';

const statusConfig = {
  submitted: {
    title: 'Claim Submitted',
    description: 'Your claim has been received and is awaiting initial review.',
    icon: Clock,
    color: 'blue',
    nextStep: 'Initial review by claims team',
    estimatedTime: '1-2 business days'
  },
  'under-review': {
    title: 'Under Review',
    description: 'A claims adjuster is reviewing your claim details and documents.',
    icon: AlertCircle,
    color: 'yellow',
    nextStep: 'Assessment completion',
    estimatedTime: '3-5 business days'
  },
  'documentation-required': {
    title: 'Additional Documents Required',
    description: 'We need more information to process your claim. Please upload the requested documents.',
    icon: FileText,
    color: 'orange',
    nextStep: 'Document submission',
    estimatedTime: 'Required within 7 days'
  },
  approved: {
    title: 'Claim Approved',
    description: 'Your claim has been approved! Payment processing will begin shortly.',
    icon: CheckCircle,
    color: 'green',
    nextStep: 'Payment processing',
    estimatedTime: '2-3 business days'
  },
  rejected: {
    title: 'Claim Rejected',
    description: 'Unfortunately, your claim has been rejected. Contact us for more information.',
    icon: XCircle,
    color: 'red',
    nextStep: 'Appeal process',
    estimatedTime: 'Appeal within 30 days'
  },
  paid: {
    title: 'Payment Processed',
    description: 'Payment has been sent to your designated account.',
    icon: DollarSign,
    color: 'purple',
    nextStep: 'Claim closure',
    estimatedTime: 'Immediate'
  },
  closed: {
    title: 'Claim Closed',
    description: 'This claim has been successfully closed.',
    icon: CheckCircle,
    color: 'gray',
    nextStep: 'No further action required',
    estimatedTime: 'Completed'
  }
};

const statusOrder = [
  'submitted',
  'under-review',
  'documentation-required',
  'approved',
  'paid',
  'closed',
  'rejected'
];

export const ClaimStatus = ({ claimId }) => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState('status');
  const { showToast } = useToast();

  useEffect(() => {
    fetchClaimDetails();
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const response = await claimService.getClaimDetails(claimId);
      setClaim(response.data);
      
      // Fetch status updates
      const updatesResponse = await claimService.getClaimUpdates(claimId);
      setUpdates(updatesResponse.data.updates || []);
    } catch (error) {
      showToast('error', 'Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = () => {
    if (!claim?.status) return 0;
    const currentIndex = statusOrder.indexOf(claim.status);
    return Math.round((currentIndex / (statusOrder.length - 1)) * 100);
  };

  const getStatusSteps = () => {
    return statusOrder.map((status, index) => {
      const config = statusConfig[status];
      const isCompleted = statusOrder.indexOf(claim?.status) >= index;
      const isCurrent = claim?.status === status;
      
      return {
        ...config,
        status,
        isCompleted,
        isCurrent,
        step: index + 1
      };
    }).filter(step => step.status !== 'rejected' || claim?.status === 'rejected');
  };

  const handleUploadDocuments = async (files) => {
    try {
      await claimService.uploadDocuments(claimId, files);
      showToast('success', 'Documents uploaded successfully');
      fetchClaimDetails();
    } catch (error) {
      showToast('error', 'Failed to upload documents');
    }
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:support@insurance.com?subject=Claim Inquiry: ${claim?.claimNumber}`;
  };

  const formatContactHours = () => {
    const now = new Date();
    const hours = now.getHours();
    const isBusinessHours = hours >= 9 && hours < 17;
    
    return {
      isOpen: isBusinessHours && now.getDay() >= 1 && now.getDay() <= 5,
      hours: 'Mon-Fri, 9:00 AM - 5:00 PM EST'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading claim status...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Claim Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          The claim you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>
    );
  }

  const currentStatus = statusConfig[claim.status];
  const contactHours = formatContactHours();
  const statusSteps = getStatusSteps();
  const progress = getStatusProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claim #{claim.claimNumber}
            </h1>
            <Badge className={`${statusConfig[claim.status].color === 'blue' ? 'bg-blue-100 text-blue-800' :
                              statusConfig[claim.status].color === 'green' ? 'bg-green-100 text-green-800' :
                              statusConfig[claim.status].color === 'red' ? 'bg-red-100 text-red-800' :
                              statusConfig[claim.status].color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              statusConfig[claim.status].color === 'orange' ? 'bg-amber-100 text-amber-800' :
                              statusConfig[claim.status].color === 'purple' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'} dark:bg-gray-800 dark:text-gray-300`}>
              {currentStatus.title.toUpperCase()}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {claim.type?.replace('-', ' ').toUpperCase()} • Filed {new Date(claim.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleContactSupport}
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          <Button
            variant="primary"
            onClick={() => {/* Navigate to claim details */}}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Details
          </Button>
        </div>
      </div>

      {/* Status Progress */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Claim Progress
          </h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentStatus.description}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Status Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
          
          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {statusSteps.map((step, index) => (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Status Dot */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-3
                    ${step.isCompleted 
                      ? 'bg-green-500 text-white' 
                      : step.isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }
                    ${step.status === 'rejected' && 'bg-red-500'}
                  `}>
                    {step.isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      Step {step.step}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {step.title}
                    </h3>
                    {step.isCurrent && (
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Next: {step.nextStep}
                        </div>
                        <div className="text-xs text-gray-500">
                          Est: {step.estimatedTime}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {['status', 'documents', 'updates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-3 px-1 font-medium text-sm border-b-2 transition-colors
                    ${activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'status' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Current Status Details
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <currentStatus.icon className={`w-5 h-5 mt-0.5 ${
                        currentStatus.color === 'blue' ? 'text-blue-600' :
                        currentStatus.color === 'green' ? 'text-green-600' :
                        currentStatus.color === 'red' ? 'text-red-600' :
                        currentStatus.color === 'yellow' ? 'text-yellow-600' :
                        currentStatus.color === 'orange' ? 'text-amber-600' :
                        currentStatus.color === 'purple' ? 'text-purple-600' :
                        'text-gray-600'
                      }`} />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {currentStatus.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {currentStatus.description}
                        </p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Next Step:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {currentStatus.nextStep}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Time:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {currentStatus.estimatedTime}
                            </span>
                          </div>
                          {claim.assignedTo && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Assigned Adjuster:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {claim.assignedTo.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Actions */}
                {claim.status === 'documentation-required' && claim.requiredDocuments && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Required Actions
                    </h3>
                    <Card className="p-4 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Additional Documents Required
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Please upload the following documents to continue processing your claim:
                          </p>
                          <ul className="space-y-2">
                            {claim.requiredDocuments.map((doc, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-gray-900 dark:text-white">{doc}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4">
                            <Button
                              variant="primary"
                              onClick={() => {/* Navigate to document upload */}}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Upload Documents
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Status Updates */}
                {updates.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Recent Updates
                    </h3>
                    <div className="space-y-3">
                      {updates.slice(0, 3).map((update, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {update.userName}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(update.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {update.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Claim Documents
                </h3>
                {/* Document list component would go here */}
              </div>
            )}

            {activeTab === 'updates' && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  All Updates
                </h3>
                {/* Full updates list would go here */}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Contact & Info */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Need Help?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Phone Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {contactHours.isOpen ? (
                      <span className="text-green-600 dark:text-green-400">• Available Now</span>
                    ) : (
                      <span className="text-gray-500">• Available {contactHours.hours}</span>
                    )}
                  </p>
                  <a
                    href="tel:+18001234567"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium block mt-2"
                  >
                    1-800-123-4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Live Chat</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    24/7 automated support with live agent option
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {/* Open chat */}}
                  >
                    Start Chat
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Get a response within 24 hours
                  </p>
                  <a
                    href={`mailto:claims@insurance.com?subject=Claim ${claim.claimNumber}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium block mt-2"
                  >
                    claims@insurance.com
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Claim Summary */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Claim Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Claimed Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${claim.claimedAmount?.toLocaleString() || '0'}
                </span>
              </div>
              
              {claim.approvedAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Approved Amount</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${claim.approvedAmount.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Incident Date</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(claim.incidentDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Policy Number</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {claim.policy?.policyNumber || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Days Open</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.floor((new Date() - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </div>
          </Card>

          {/* Important Notes */}
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Important Notes
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Keep all original documents for your records</li>
                  <li>• Respond promptly to any requests for information</li>
                  <li>• Save all correspondence related to this claim</li>
                  <li>• Contact us immediately if your situation changes</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};