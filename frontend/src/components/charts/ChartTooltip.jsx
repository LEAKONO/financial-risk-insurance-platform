import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const ChartTooltip = ({ data, visible, position, config = {} }) => {
  const {
    title = 'Tooltip',
    showTrend = true,
    showPercentage = true,
    customFormatter = null
  } = config;

  if (!visible || !data) return null;

  const formatValue = (value) => {
    if (customFormatter) return customFormatter(value);
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return value;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="text-green-500" size={14} />;
    if (trend < 0) return <TrendingDown className="text-red-500" size={14} />;
    return <Minus className="text-gray-500" size={14} />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 pointer-events-none min-w-[200px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <div className="flex items-center space-x-2">
            <Info className="text-blue-500" size={16} />
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
          {showTrend && data.trend !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(data.trend)}
              <span className={`text-sm font-medium ${
                data.trend > 0 ? 'text-green-600' :
                data.trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {data.trend > 0 ? '+' : ''}{data.trend}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'trend' || key === 'x' || key === 'y') return null;
            
            const isPercentage = showPercentage && key.toLowerCase().includes('percentage');
            const displayValue = isPercentage ? `${value}%` : formatValue(value);
            
            return (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-semibold text-gray-800">
                  {displayValue}
                </span>
              </div>
            );
          })}

          {/* Coordinate data for line/area charts */}
          {(data.x || data.y) && (
            <div className="pt-2 mt-2 border-t">
              {data.x && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">X Value</span>
                  <span className="font-semibold text-gray-800">
                    {typeof data.x === 'string' ? data.x : data.x.toLocaleDateString()}
                  </span>
                </div>
              )}
              {data.y && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Y Value</span>
                  <span className="font-semibold text-gray-800">
                    {formatValue(data.y)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with additional info */}
        {data.additionalInfo && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">{data.additionalInfo}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced tooltip for comparison
export const ComparisonTooltip = ({ data, visible, position, config = {} }) => {
  const { title = 'Comparison', showDifference = true } = config;

  if (!visible || !data || !data.current || !data.previous) return null;

  const difference = data.current.value - data.previous.value;
  const percentageChange = data.previous.value !== 0 
    ? (difference / data.previous.value) * 100 
    : 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 pointer-events-none min-w-[240px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b">
          <div className="flex items-center space-x-2">
            <Info className="text-purple-500" size={16} />
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            percentageChange > 0 ? 'text-green-600' :
            percentageChange < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {percentageChange > 0 ? <TrendingUp size={14} /> :
             percentageChange < 0 ? <TrendingDown size={14} /> :
             <Minus size={14} />}
            <span className="text-sm font-medium">
              {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Comparison Data */}
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Current Period</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{data.current.label}</span>
              <span className="font-bold text-lg text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(data.current.value)}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Previous Period</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{data.previous.label}</span>
              <span className="font-bold text-lg text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(data.previous.value)}
              </span>
            </div>
          </div>

          {showDifference && (
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Difference</span>
                <span className={`font-semibold ${
                  difference > 0 ? 'text-green-600' :
                  difference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {difference > 0 ? '+' : ''}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(difference)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Additional context */}
        {data.context && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">{data.context}</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Simple tooltip for basic charts
export const SimpleTooltip = ({ title, value, visible, position, color = '#4f46e5' }) => {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bg-gray-900 text-white rounded-lg px-3 py-2 text-sm z-50 pointer-events-none whitespace-nowrap"
        style={{
          left: `${position.x}px`,
          top: `${position.y - 40}px`,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <div>
            {title && <div className="font-medium">{title}</div>}
            <div>{value}</div>
          </div>
        </div>
        {/* Arrow */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
          style={{ color: '#1f2937' }}
        >
          <svg width="12" height="6" viewBox="0 0 12 6" fill="currentColor">
            <path d="M6 6L0 0H12L6 6Z" />
          </svg>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChartTooltip;