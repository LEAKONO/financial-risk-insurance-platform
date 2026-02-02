import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Calendar,
  MapPin, Shield, CreditCard,
  TrendingUp, FileText, AlertCircle,
  CheckCircle, XCircle, Clock,
  Edit, Download, Activity,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Tabs } from '@/components/ui/Tabs/Tabs';
import { Chart } from '@/components/ui/Chart/Chart';

export const UserDetails = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Mock user data
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        avatar: null,
        status: 'active',
        role: 'customer',
        joinedDate: '2023-01-15',
        lastLogin: '2024-01-20T10:30:00Z',
        address: '123 Main St, New York, NY 10001',
        totalPolicies: 3,
        totalClaims: 5,
        totalPayments: 12500,
        satisfaction: 4.5,
        riskScore: 32,
        policies: [
          {
            id: 'POL001',
            name: 'Home Insurance',
            status: 'active',
            premium: 1200,
            coverage: 500000,
            startDate: '2023-03-01',
            endDate: '2024-03-01'
          },
          {
            id: 'POL002',
            name: 'Auto Insurance',
            status: 'active',
            premium: 850,
            coverage: 250000,
            startDate: '2023-05-15',
            endDate: '2024-05-15'
          },
          {
            id: 'POL003',
            name: 'Life Insurance',
            status: 'pending',
            premium: 2000,
            coverage: 1000000,
            startDate: '2023-12-01',
            endDate: '2033-12-01'
          }
        ],
        claims: [
          {
            id: 'CLM001',
            type: 'auto',
            status: 'approved',
            amount: 3500,
            date: '2023-06-15',
            description: 'Car accident - front bumper damage'
          },
          {
            id: 'CLM002',
            type: 'property',
            status: 'paid',
            amount: 12500,
            date: '2023-08-22',
            description: 'Home water damage - kitchen renovation'
          }
        ],
        activity: [
          {
            id: 'ACT001',
            action: 'login',
            timestamp: '2024-01-20T10:30:00Z',
            details: 'Logged in from New York'
          },
          {
            id: 'ACT002',
            action: 'claim_submitted',
            timestamp: '2024-01-15T14:45:00Z',
            details: 'Submitted auto claim #CLM001'
          },
          {
            id: 'ACT003',
            action: 'payment',
            timestamp: '2024-01-10T09:15:00Z',
            details: 'Made premium payment - $850'
          }
        ]
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} dark:bg-gray-800 dark:text-gray-300`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800' },
      customer: { color: 'bg-blue-100 text-blue-800' },
      agent: { color: 'bg-green-100 text-green-800' },
      support: { color: 'bg-orange-100 text-orange-800' }
    };
    const config = roleConfig[role] || roleConfig.customer;
    
    return (
      <Badge className={`${config.color} dark:bg-gray-800 dark:text-gray-300`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          User Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          The user you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Policies',
      value: user.totalPolicies,
      change: 33,
      trend: 'up',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Claims',
      value: user.totalClaims,
      change: -20,
      trend: 'down',
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      label: 'Total Payments',
      value: formatCurrency(user.totalPayments),
      change: 45,
      trend: 'up',
      icon: CreditCard,
      color: 'bg-green-500'
    },
    {
      label: 'Satisfaction',
      value: user.satisfaction,
      change: 12,
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  const activityChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Activity Count',
        data: [12, 19, 8, 15, 22, 18, 25],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              {getStatusBadge(user.status)}
              {getRoleBadge(user.role)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              User ID: {user.id} • Joined {formatDate(user.joinedDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={`
                  ${stat.trend === 'up' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }
                `}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div>
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'policies', label: 'Policies' },
            { id: 'claims', label: 'Claims' },
            { id: 'activity', label: 'Activity' },
            { id: 'documents', label: 'Documents' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Phone</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Address</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.address}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Last Login</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(user.lastLogin)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Activity Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Activity Trend
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly user activity overview
                    </p>
                  </div>
                  <Activity className="w-5 h-5 text-gray-500" />
                </div>
                
                <div className="h-64">
                  <Chart
                    type="line"
                    data={activityChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            </>
          )}

          {activeTab === 'policies' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Insurance Policies
                </h3>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {user.policies.length} policies
                </Badge>
              </div>
              
              <div className="space-y-4">
                {user.policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {policy.name}
                          </h4>
                          <Badge className={
                            policy.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {policy.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Policy #{policy.id} • {formatCurrency(policy.coverage)} coverage
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(policy.premium)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          annual premium
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Start Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(policy.startDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">End Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(policy.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'claims' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Claim History
                </h3>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                  {user.claims.length} claims
                </Badge>
              </div>
              
              <div className="space-y-4">
                {user.claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)} Claim
                          </h4>
                          <Badge className={
                            claim.status === 'approved' || claim.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : claim.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          #{claim.id} • {formatDate(claim.date)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {claim.description}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(claim.amount)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          claim amount
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <Activity className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="space-y-4">
                {user.activity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {activity.action.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(activity.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Risk Assessment */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Risk Assessment
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Risk Score</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      user.riskScore < 30 ? 'bg-green-500' :
                      user.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${user.riskScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low Risk</span>
                  <span>Medium</span>
                  <span>High Risk</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  Risk Factors
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Claim frequency: Moderate</li>
                  <li>• Payment history: Excellent</li>
                  <li>• Policy coverage: Adequate</li>
                  <li>• Activity level: High</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Add New Policy
              </Button>
            </div>
          </Card>

          {/* Account Summary */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Account Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(user.joinedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(user.totalPayments)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Policies</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.policies.filter(p => p.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Satisfaction</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {user.satisfaction}/5
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};