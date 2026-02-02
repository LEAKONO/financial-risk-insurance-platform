import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Heart, Home, Car, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';

const coverageTypes = [
  {
    id: 'life',
    name: 'Life Insurance',
    description: 'Protect your family with comprehensive life coverage',
    icon: Heart,
    color: 'bg-red-500',
    features: [
      'Death benefit up to $1,000,000',
      'Accidental death coverage',
      'Terminal illness benefit',
      'Flexible premium options'
    ],
    baseRate: 25,
    minCoverage: 50000,
    maxCoverage: 5000000
  },
  {
    id: 'health',
    name: 'Health Insurance',
    description: 'Complete health coverage for medical expenses',
    icon: Heart,
    color: 'bg-green-500',
    features: [
      'Hospitalization coverage',
      'Outpatient treatment',
      'Prescription drugs',
      'Preventive care'
    ],
    baseRate: 150,
    minCoverage: 10000,
    maxCoverage: 500000
  },
  {
    id: 'property',
    name: 'Property Insurance',
    description: 'Protect your home and belongings',
    icon: Home,
    color: 'bg-blue-500',
    features: [
      'Fire and theft protection',
      'Natural disaster coverage',
      'Liability protection',
      'Temporary living expenses'
    ],
    baseRate: 100,
    minCoverage: 100000,
    maxCoverage: 2000000
  },
  {
    id: 'auto',
    name: 'Auto Insurance',
    description: 'Comprehensive vehicle protection',
    icon: Car,
    color: 'bg-purple-500',
    features: [
      'Collision coverage',
      'Liability protection',
      'Comprehensive damage',
      'Roadside assistance'
    ],
    baseRate: 75,
    minCoverage: 25000,
    maxCoverage: 500000
  },
  {
    id: 'disability',
    name: 'Disability Insurance',
    description: 'Income protection during disability',
    icon: Briefcase,
    color: 'bg-amber-500',
    features: [
      'Monthly income replacement',
      'Partial disability coverage',
      'Rehabilitation benefits',
      'Cost of living adjustments'
    ],
    baseRate: 50,
    minCoverage: 2000,
    maxCoverage: 10000
  }
];

export const CoverageSelector = ({ onSelect, selectedCoverage = [], onNext }) => {
  const [coverageAmount, setCoverageAmount] = useState({});
  const [selectedType, setSelectedType] = useState('life');
  const [termLength, setTermLength] = useState(20);

  const handleCoverageSelect = (coverageId) => {
    setSelectedType(coverageId);
  };

  const calculatePremium = (coverage) => {
    const base = coverage.baseRate || 0;
    const amount = coverageAmount[coverage.id] || coverage.minCoverage;
    const rate = (amount / 10000) * base;
    return Math.round(rate * termLength / 12);
  };

  const handleAmountChange = (coverageId, amount) => {
    setCoverageAmount(prev => ({
      ...prev,
      [coverageId]: Math.max(
        coverageTypes.find(c => c.id === coverageId)?.minCoverage || 0,
        Math.min(
          coverageTypes.find(c => c.id === coverageId)?.maxCoverage || Infinity,
          amount
        )
      )
    }));
  };

  const getCoverageInfo = (coverageId) => {
    return coverageTypes.find(c => c.id === coverageId);
  };

  const totalPremium = coverageTypes.reduce((total, coverage) => {
    if (selectedCoverage.includes(coverage.id)) {
      return total + calculatePremium(coverage);
    }
    return total;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Your Coverage
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the insurance coverage that best fits your needs
        </p>
      </div>

      {/* Coverage Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {coverageTypes.map((coverage, index) => {
          const Icon = coverage.icon;
          const isSelected = selectedType === coverage.id;
          
          return (
            <motion.div
              key={coverage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleCoverageSelect(coverage.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${coverage.color} p-2 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {coverage.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Starting at ${coverage.baseRate}/month
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {coverage.description}
                </p>

                <div className="space-y-2">
                  {coverage.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Coverage Amount
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">$</span>
                          <input
                            type="range"
                            min={coverage.minCoverage}
                            max={coverage.maxCoverage}
                            step={10000}
                            value={coverageAmount[coverage.id] || coverage.minCoverage}
                            onChange={(e) => handleAmountChange(coverage.id, parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <input
                            type="number"
                            min={coverage.minCoverage}
                            max={coverage.maxCoverage}
                            value={coverageAmount[coverage.id] || coverage.minCoverage}
                            onChange={(e) => handleAmountChange(coverage.id, parseInt(e.target.value) || 0)}
                            className="w-32 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>${coverage.minCoverage.toLocaleString()}</span>
                          <span>${coverage.maxCoverage.toLocaleString()}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Term Length (years)
                        </label>
                        <div className="flex gap-2">
                          {[10, 15, 20, 25, 30].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setTermLength(term)}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                                termLength === term
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Coverage Details */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {getCoverageInfo(selectedType)?.name} Coverage
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Estimated premium: <span className="font-bold text-blue-600 dark:text-blue-400">
                  ${calculatePremium(getCoverageInfo(selectedType)).toLocaleString()} annually
                </span>
              </p>
              
              <div className="flex items-center gap-4">
                <Badge variant="success" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Active Coverage
                </Badge>
                <span className="text-sm text-gray-500">
                  {coverageAmount[selectedType]?.toLocaleString() || 
                   getCoverageInfo(selectedType)?.minCoverage.toLocaleString()} coverage
                </span>
                <span className="text-sm text-gray-500">
                  {termLength} year term
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                const coverage = getCoverageInfo(selectedType);
                onSelect({
                  type: selectedType,
                  name: coverage.name,
                  coverageAmount: coverageAmount[selectedType] || coverage.minCoverage,
                  premium: calculatePremium(coverage),
                  termLength
                });
                onNext?.();
              }}
              className="px-8 py-3 text-lg"
            >
              Add to Policy
            </Button>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Coverage Summary
          </h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${totalPremium.toLocaleString()}/year
          </span>
        </div>

        {selectedCoverage.length > 0 ? (
          <div className="space-y-3">
            {selectedCoverage.map((coverageId) => {
              const coverage = getCoverageInfo(coverageId);
              return (
                <div key={coverageId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`${coverage.color} p-2 rounded-lg`}>
                      {React.createElement(coverage.icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {coverage.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ${(coverageAmount[coverageId] || coverage.minCoverage).toLocaleString()} coverage
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${calculatePremium(coverage).toLocaleString()}/year
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No coverage selected yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Select coverage types above to build your policy
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};