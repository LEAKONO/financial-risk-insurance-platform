import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import RiskAssessmentModal from "@/components/risk/RiskAssessmentModal";
import { Button } from "@/components/ui/Button";
import { riskService } from "@/services/api";

const RiskAssessment = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Check if profile exists
  useEffect(() => {
    checkRiskProfile();
  }, []);

  const checkRiskProfile = async () => {
    try {
      setLoading(true);
      const response = await riskService.getProfile();
      setHasProfile(response.success && response.data);
    } catch (error) {
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (data) => {
    try {
      const response = await riskService.createOrUpdateRiskProfile(data);
      if (response.success) {
        setHasProfile(true);
        setIsModalOpen(false);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <ShieldCheckIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {hasProfile ? 'Risk Profile Complete' : 'Risk Assessment Required'}
          </h1>
          <p className="text-xl text-gray-600">
            {hasProfile 
              ? 'Your risk profile is ready. You can now create policies.'
              : 'Complete your risk profile to start creating insurance policies.'}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {hasProfile ? (
            <div className="text-center">
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✓ Risk Profile Complete
              </h2>
              <p className="text-gray-600 mb-8">
                You can now create insurance policies with accurate premium calculations.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/dashboard/policies">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Create Policy
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                >
                  Update Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Required Information
                </h2>
                <p className="text-gray-600 mb-6">
                  We need this information to calculate your personalized premiums
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <span className="font-medium">Age & Occupation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <span className="font-medium">Income & Employment</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <span className="font-medium">Health Information</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <span className="font-medium">Financial Details</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg"
              >
                Start Risk Assessment
                <ArrowRightIcon className="w-5 h-5 ml-3" />
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Takes only 2-3 minutes to complete
              </p>
            </div>
          )}
        </motion.div>

        {/* Why it's required */}
        {!hasProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Why is this required?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Accurate Premiums:</strong> Calculate personalized rates based on your profile</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Better Coverage:</strong> Get recommendations tailored to your needs</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Risk Management:</strong> Understand and improve your risk factors</span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <RiskAssessmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={{}}
          onProfileSubmit={handleProfileSubmit}
          onPremiumCalculated={() => {}}
        />
      )}
    </div>
  );
};

export default RiskAssessment;