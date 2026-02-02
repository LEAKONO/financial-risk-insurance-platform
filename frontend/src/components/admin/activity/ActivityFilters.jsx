import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Calendar, User, X, 
  ChevronDown, ChevronUp, RefreshCw 
} from 'lucide-react';

export const ActivityFilters = ({ onFilterChange, loading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    entity: '',
    userId: '',
    startDate: '',
    endDate: '',
    severity: ''
  });

  const actions = ['create', 'update', 'delete', 'login', 'logout', 'view'];
  const entities = ['user', 'policy', 'claim', 'risk-profile', 'system'];
  const severities = ['low', 'medium', 'high'];

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      action: '',
      entity: '',
      userId: '',
      startDate: '',
      endDate: '',
      severity: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex flex-col space-y-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="text-indigo-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Filter Activities</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <span>{isExpanded ? 'Less Options' : 'More Options'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <X size={18} />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search activities by description, user, or entity..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {loading && (
            <RefreshCw className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-600 animate-spin" size={20} />
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                {/* Action Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Type
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleChange('action', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Actions</option>
                    {actions.map((action) => (
                      <option key={action} value={action} className="capitalize">
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity
                  </label>
                  <select
                    value={filters.entity}
                    onChange={(e) => handleChange('entity', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Entities</option>
                    {entities.map((entity) => (
                      <option key={entity} value={entity} className="capitalize">
                        {entity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={filters.severity}
                    onChange={(e) => handleChange('severity', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Severities</option>
                    {severities.map((severity) => (
                      <option key={severity} value={severity} className="capitalize">
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* User ID Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter User ID"
                      value={filters.userId}
                      onChange={(e) => handleChange('userId', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Filters
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (value && key !== 'search') {
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                          >
                            {key}: {value}
                            <button
                              onClick={() => handleChange(key, '')}
                              className="ml-2 text-indigo-500 hover:text-indigo-700"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        );
                      }
                      return null;
                    })}
                    {!Object.entries(filters).some(([key, value]) => value && key !== 'search') && (
                      <span className="text-gray-500 text-sm">No filters applied</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ActivityFilters;