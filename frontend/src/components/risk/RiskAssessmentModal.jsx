// frontend/src/components/risk/RiskAssessmentModal.jsx
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { RiskProfileForm } from './RiskProfileForm';
import { RiskCalculator } from './RiskCalculator';

const RiskAssessmentModal = ({
  isOpen,
  onClose,
  initialData = {},
  onProfileSubmit,
  onPremiumCalculated,
}) => {
  const [activeMode, setActiveMode] = useState('profile');

  const handleCancel = () => {
    onClose();
  };

  const handleProfileSubmit = (data) => {
    if (onProfileSubmit) {
      onProfileSubmit(data);
    }
    onClose();
  };

  const handlePremiumCalculated = (premiumData) => {
    if (onPremiumCalculated) {
      onPremiumCalculated(premiumData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Risk Assessment"
      size="lg"
    >
      {/* Mode selection tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveMode('profile')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeMode === 'profile'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                }
              `}
            >
              👤 Risk Profile
            </button>
            <button
              onClick={() => setActiveMode('calculator')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeMode === 'calculator'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
                }
              `}
            >
              🧮 Premium Calculator
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on mode */}
      <div className="min-h-[400px]">
        {activeMode === 'profile' ? (
          <RiskProfileForm
            initialData={initialData}
            onSubmit={handleProfileSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <RiskCalculator
            onPremiumCalculated={handlePremiumCalculated}
            onCancel={handleCancel}
          />
        )}
      </div>
    </Modal>
  );
};

export default RiskAssessmentModal;