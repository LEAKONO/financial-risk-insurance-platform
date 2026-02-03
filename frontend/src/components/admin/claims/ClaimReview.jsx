import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, AlertCircle,
  FileText, DollarSign, Calendar, User,
  MessageSquare, Paperclip, Send, Save
} from 'lucide-react';
import { claimService } from "../../../services/api";
import { Loader, Toast } from '../../common';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const ClaimReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    approvedAmount: '',
    notes: '',
    recommendations: '',
    requiresFollowUp: false,
    followUpDate: ''
  });
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState(null);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const data = await claimService.getClaimById(id);
      setClaim(data);
      setReviewData({
        status: data.status,
        approvedAmount: data.approvedAmount || '',
        notes: data.reviewNotes || '',
        recommendations: '',
        requiresFollowUp: false,
        followUpDate: ''
      });
      setDocuments(data.documents || []);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to load claim for review' });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (action) => {
    try {
      const data = {
        ...reviewData,
        status: action,
        reviewedAt: new Date().toISOString()
      };

      await claimService.updateClaimStatus(id, data);
      
      setToast({ 
        type: 'success', 
        message: `Claim ${action} successfully` 
      });
      
      setTimeout(() => {
        navigate(`/admin/claims/${id}`);
      }, 1500);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to submit review' });
    }
  };

  const handleDocumentUpload = async () => {
    if (!newDocument) return;
    
    try {
      const formData = new FormData();
      formData.append('document', newDocument);
      
      await claimService.uploadDocument(id, formData);
      setToast({ type: 'success', message: 'Document uploaded successfully' });
      setNewDocument(null);
      fetchClaim();
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to upload document' });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <Loader />;
  if (!claim) return <div>Claim not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <Toast toast={toast} onClose={() => setToast(null)} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Claim Review</h1>
            <p className="text-indigo-100">Review and process claim #{claim.claimNumber}</p>
          </div>
          <StatusBadge status={claim.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Claim Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Claim Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard
                icon={<FileText className="text-blue-500" />}
                label="Claim Type"
                value={claim.type}
              />
              <DetailCard
                icon={<Calendar className="text-green-500" />}
                label="Incident Date"
                value={new Date(claim.incidentDate).toLocaleDateString()}
              />
              <DetailCard
                icon={<DollarSign className="text-yellow-500" />}
                label="Claimed Amount"
                value={formatCurrency(claim.claimedAmount)}
              />
              <DetailCard
                icon={<User className="text-purple-500" />}
                label="Claimant"
                value={claim.user?.name}
              />
            </div>
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                {claim.description}
              </p>
            </div>
          </motion.div>

          {/* Review Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Review Details</h2>
            
            <div className="space-y-6">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Decision
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setReviewData({...reviewData, status: 'approved'})}
                    className={`p-4 rounded-lg border-2 flex items-center justify-center space-x-3 transition-all ${
                      reviewData.status === 'approved'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircle size={24} />
                    <span className="font-semibold">Approve Claim</span>
                  </button>
                  <button
                    onClick={() => setReviewData({...reviewData, status: 'rejected'})}
                    className={`p-4 rounded-lg border-2 flex items-center justify-center space-x-3 transition-all ${
                      reviewData.status === 'rejected'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <XCircle size={24} />
                    <span className="font-semibold">Reject Claim</span>
                  </button>
                </div>
              </div>

              {/* Approved Amount */}
              {reviewData.status === 'approved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max={claim.claimedAmount}
                      value={reviewData.approvedAmount}
                      onChange={(e) => setReviewData({...reviewData, approvedAmount: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter approved amount"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Claimed amount: {formatCurrency(claim.claimedAmount)}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Add your review notes here..."
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={reviewData.recommendations}
                  onChange={(e) => setReviewData({...reviewData, recommendations: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Any recommendations for the claimant..."
                />
              </div>

              {/* Follow Up */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="text-yellow-500" />
                  <div>
                    <div className="font-medium">Requires Follow Up</div>
                    <div className="text-sm text-gray-500">Schedule a follow-up if needed</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewData.requiresFollowUp}
                    onChange={(e) => setReviewData({...reviewData, requiresFollowUp: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {reviewData.requiresFollowUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={reviewData.followUpDate}
                    onChange={(e) => setReviewData({...reviewData, followUpDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Actions & Documents */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Submit Review</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleReviewSubmit('approved')}
                disabled={!reviewData.status}
              >
                <CheckCircle size={18} />
                Submit Approval
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => handleReviewSubmit('rejected')}
                disabled={!reviewData.status}
              >
                <XCircle size={18} />
                Submit Rejection
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/admin/claims/${id}`)}
              >
                <Clock size={18} />
                Save as Draft
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate(-1)}
              >
                Cancel Review
              </Button>
            </div>
          </motion.div>

          {/* Document Upload */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Add Supporting Document</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Paperclip className="mx-auto text-gray-400 mb-3" size={32} />
                <input
                  type="file"
                  id="document-upload"
                  onChange={(e) => setNewDocument(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {newDocument ? newDocument.name : 'Choose a file'}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
              {newDocument && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDocumentUpload}
                >
                  <Send size={18} />
                  Upload Document
                </Button>
              )}
            </div>
          </motion.div>

          {/* Existing Documents */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Existing Documents</h3>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No documents uploaded</p>
              ) : (
                documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{doc.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
    <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  </div>
);

export default ClaimReview;