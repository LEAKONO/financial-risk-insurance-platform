import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PolicyCard from "../../../components/policy/PolicyCard";
import PolicyForm from "../../../components/policy/PolicyForm";
import Modal from "../../../components/ui/Modal/Modal";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Form/Input";
import Select from "../../../components/ui/Form/Select";
import { policyService } from "../../../services/api";

const DashboardPolicies = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // API STATE
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH POLICIES FROM API
  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getUserPolicies();

      if (response.success) {
        // Check if policies array exists in response
        if (
          response.data &&
          response.data.policies &&
          Array.isArray(response.data.policies)
        ) {
          const transformedPolicies = response.data.policies.map((policy) => ({
            id: policy._id,
            name: policy.name,
            policyNumber: policy.policyNumber,
            premium: policy.totalPremium
              ? `$${policy.totalPremium}/month`
              : "$0/month",
            status: policy.status,
            nextPayment:
              policy.premiumSchedule &&
              policy.premiumSchedule[0] &&
              policy.premiumSchedule[0].dueDate
                ? new Date(policy.premiumSchedule[0].dueDate)
                    .toISOString()
                    .split("T")[0]
                : "N/A",
            coverage:
              policy.coverage &&
              policy.coverage[0] &&
              policy.coverage[0].coverageAmount
                ? `$${policy.coverage[0].coverageAmount.toLocaleString()}`
                : "$0",
            type:
              policy.coverage && policy.coverage[0] && policy.coverage[0].type,
            startDate: policy.startDate
              ? new Date(policy.startDate).toISOString().split("T")[0]
              : "N/A",
            endDate: policy.endDate
              ? new Date(policy.endDate).toISOString().split("T")[0]
              : "N/A",
          }));

          setPolicies(transformedPolicies);
        } else {
          // No policies in response
          setPolicies([]);
        }
      } else {
        setError(response.message || "Failed to load policies");
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Filter policies
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      searchTerm === "" ||
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || policy.status === filterStatus;
    const matchesType = filterType === "all" || policy.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "life", label: "Life Insurance" },
    { value: "health", label: "Health Insurance" },
    { value: "auto", label: "Auto Insurance" },
    { value: "property", label: "Property Insurance" },
    { value: "travel", label: "Travel Insurance" },
    { value: "disability", label: "Disability Insurance" },
  ];

  // Calculate stats from actual data
  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.status === "active").length,
    monthlyPremium: policies
      .filter((p) => p.status === "active")
      .reduce((sum, p) => {
        const premiumValue =
          parseFloat(p.premium.replace(/[^0-9.-]+/g, "")) || 0;
        return sum + premiumValue;
      }, 0),
    totalCoverage: policies.reduce((sum, p) => {
      const coverageValue =
        parseFloat(p.coverage.replace(/[^0-9.-]+/g, "")) || 0;
      return sum + coverageValue;
    }, 0),
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading policies...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <Button onClick={fetchPolicies}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Policies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all your insurance policies in one place
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto"
        >
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Policy</span>
          </Button>
        </motion.div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="text-xl md:text-2xl font-bold mb-2">
            {stats.total}
          </div>
          <div className="text-sm md:text-base text-blue-100">
            Total Policies
          </div>
          <div className="text-xs md:text-sm text-blue-200 mt-2">
            {stats.active} active policies
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="text-xl md:text-2xl font-bold mb-2">
            ${stats.monthlyPremium.toFixed(0)}
          </div>
          <div className="text-sm md:text-base text-emerald-100">
            Monthly Premium
          </div>
          <div className="text-xs md:text-sm text-emerald-200 mt-2">
            ${(stats.monthlyPremium * 12).toFixed(0)} annually
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="text-xl md:text-2xl font-bold mb-2">
            ${(stats.totalCoverage / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm md:text-base text-purple-100">
            Total Coverage
          </div>
          <div className="text-xs md:text-sm text-purple-200 mt-2">
            Across all policies
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm md:shadow-xl">
        <div className="space-y-6">
          {/* Search Input */}
          <div className="w-full">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search policies by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Filter Controls - Left side */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Status Filter */}
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusOptions}
                  className="w-full"
                />
              </div>

              {/* Type Filter */}
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  options={typeOptions}
                  className="w-full"
                />
              </div>

              {/* View Toggle */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg h-full">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-600 shadow"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    aria-label="Grid view"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:hidden">Grid</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-md transition-colors ${
                      viewMode === "table"
                        ? "bg-white dark:bg-gray-600 shadow"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    aria-label="Table view"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <TableCellsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:hidden">Table</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Export Button - Right side */}
            <div className="w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full md:w-auto flex items-center justify-center space-x-2 border-gray-300 dark:border-gray-600"
              >
                <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap text-sm sm:text-base">
                  Export Data
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Grid/Table */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {filteredPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PolicyCard {...policy} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-sm md:shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Policy Details
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Type
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Premium
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Next Payment
                        </th>
                        <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPolicies.map((policy) => (
                        <tr
                          key={policy.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        >
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                {policy.name}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                {policy.policyNumber}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                Coverage: {policy.coverage}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {policy.type || "General"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-900 dark:text-white font-medium text-sm md:text-base">
                            {policy.premium}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                                policy.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : policy.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {policy.status
                                ? policy.status.charAt(0).toUpperCase() +
                                  policy.status.slice(1)
                                : "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 dark:text-gray-400 text-sm md:text-base">
                            {policy.nextPayment}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <div className="flex items-center space-x-1 md:space-x-2">
                              <button
                                className="p-1 md:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View"
                              >
                                <EyeIcon className="w-4 h-4 md:w-4 md:h-4" />
                              </button>
                              <button
                                className="p-1 md:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="w-4 h-4 md:w-4 md:h-4" />
                              </button>
                              <button
                                className="p-1 md:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4 md:w-4 md:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredPolicies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8 md:py-12"
        >
          <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FunnelIcon className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-2">
            {policies.length === 0
              ? "You don't have any policies yet"
              : "No policies match your search"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
            {policies.length === 0
              ? "Create your first policy to get started!"
              : "Try adjusting your search or filter"}
          </p>
          {policies.length === 0 ? (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Create Your First Policy
            </Button>
          ) : (
            <Button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterType("all");
              }}
              className="w-full sm:w-auto"
            >
              Clear All Filters
            </Button>
          )}
        </motion.div>
      )}

      {/* New Policy Modal */}
      {/* New Policy Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Policy"
        size="lg"
      >
        <PolicyForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPolicies();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default DashboardPolicies;
