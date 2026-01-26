const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const RiskProfile = require('../models/RiskProfile');
const ActivityLog = require('../models/ActivityLog');
const { logger } = require('../utils/logger.util');
class AnalyticsService {
  /**
   * Get system-wide analytics
   * @returns {Promise<Object>} System analytics
   */
  async getSystemAnalytics() {
    try {
      const [
        totalUsers,
        totalPolicies,
        totalClaims,
        totalRevenue,
        recentActivities,
        userGrowth,
        policyStats,
        claimStats
      ] = await Promise.all([
        // Total counts
        User.countDocuments(),
        Policy.countDocuments(),
        Claim.countDocuments(),
        
        // Total revenue from active policies
        Policy.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: null, total: { $sum: '$totalPremium' } } }
        ]),
        
        // Recent activities
        ActivityLog.find()
          .sort({ timestamp: -1 })
          .limit(10)
          .populate('user', 'firstName lastName email')
          .lean(),
        
        // User growth (last 6 months)
        User.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 6 }
        ]),
        
        // Policy statistics
        Policy.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalPremium: { $sum: '$totalPremium' }
            }
          }
        ]),
        
        // Claim statistics
        Claim.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalClaimed: { $sum: '$claimedAmount' },
              totalApproved: { $sum: '$approvedAmount' }
            }
          }
        ])
      ]);
      
      // Risk distribution
      const riskDistribution = await RiskProfile.aggregate([
        {
          $group: {
            _id: '$riskCategory',
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Monthly revenue trend (last 6 months)
      const revenueTrend = await Policy.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalPremium' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]);
      
      // Top policies by premium
      const topPolicies = await Policy.find()
        .sort({ totalPremium: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email')
        .lean();
      
      // Recent claims with high amounts
      const recentHighClaims = await Claim.find()
        .sort({ claimedAmount: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email')
        .populate('policy', 'policyNumber name')
        .lean();
      
      return {
        overview: {
          totalUsers,
          totalPolicies,
          totalClaims,
          totalRevenue: totalRevenue[0]?.total || 0,
          activeUsers: await User.countDocuments({ isActive: true }),
          pendingClaims: await Claim.countDocuments({ status: 'submitted' })
        },
        userGrowth: this.formatGrowthData(userGrowth),
        policyStats: this.formatStats(policyStats),
        claimStats: this.formatStats(claimStats),
        riskDistribution: this.formatDistribution(riskDistribution),
        revenueTrend: this.formatTrendData(revenueTrend),
        topPolicies,
        recentHighClaims,
        recentActivities
      };
    } catch (error) {
      logger.error(`Get system analytics error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get user dashboard analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User dashboard data
   */
  async getUserDashboard(userId) {
    try {
      const [
        policies,
        claims,
        riskProfile,
        premiumTrends,
        recentActivities
      ] = await Promise.all([
        // User policies
        Policy.find({ user: userId })
          .sort({ createdAt: -1 })
          .lean(),
        
        // User claims
        Claim.find({ user: userId })
          .sort({ createdAt: -1 })
          .populate('policy', 'policyNumber name')
          .lean(),
        
        // Risk profile
        RiskProfile.findOne({ user: userId }).lean(),
        
        // Premium trends (last 6 months)
        this.getPremiumTrends(userId),
        
        // Recent activities
        ActivityLog.find({ user: userId })
          .sort({ timestamp: -1 })
          .limit(10)
          .lean()
      ]);
      
      // Calculate statistics
      const stats = {
        activePolicies: policies.filter(p => p.status === 'active').length,
        totalCoverage: policies.reduce((sum, policy) => {
          return sum + policy.coverage.reduce((covSum, cov) => covSum + cov.coverageAmount, 0);
        }, 0),
        totalPremium: policies.reduce((sum, policy) => sum + policy.totalPremium, 0),
        openClaims: claims.filter(c => ['submitted', 'under-review', 'documentation-required'].includes(c.status)).length,
        totalClaims: claims.length,
        nextPayment: this.calculateNextPayment(policies)
      };
      
      // Claim trends
      const claimTrends = this.getClaimTrends(claims);
      
      return {
        stats,
        policies,
        recentPolicies: policies.slice(0, 5),
        claims,
        recentClaims: claims.slice(0, 5),
        riskProfile,
        premiumTrends,
        claimTrends,
        recentActivities
      };
    } catch (error) {
      logger.error(`Get user dashboard error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get premium trends for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Premium trends data
   */
  async getPremiumTrends(userId) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const trends = await Policy.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalPremium: { $sum: '$totalPremium' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      
      // Format for chart display
      return trends.map(trend => ({
        month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
        premium: trend.totalPremium
      }));
    } catch (error) {
      logger.error(`Get premium trends error: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Get claim trends from claims data
   * @param {Array} claims - User claims
   * @returns {Object} Formatted claim trends
   */
  getClaimTrends(claims) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyClaims = {};
    const months = [];
    
    // Generate last 6 months labels
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);
      monthlyClaims[monthKey] = 0;
    }
    
    // Count claims per month
    claims.forEach(claim => {
      if (claim.createdAt >= sixMonthsAgo) {
        const monthKey = `${claim.createdAt.getFullYear()}-${String(claim.createdAt.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyClaims[monthKey] !== undefined) {
          monthlyClaims[monthKey]++;
        }
      }
    });
    
    return {
      months,
      counts: months.map(month => monthlyClaims[month])
    };
  }
  
  /**
   * Calculate next payment amount
   * @param {Array} policies - User policies
   * @returns {number} Next payment amount
   */
  calculateNextPayment(policies) {
    const now = new Date();
    let nextPayment = 0;
    
    policies.forEach(policy => {
      if (policy.status === 'active' && policy.premiumSchedule) {
        const upcomingPayment = policy.premiumSchedule.find(schedule => 
          !schedule.paid && new Date(schedule.dueDate) > now
        );
        
        if (upcomingPayment) {
          nextPayment += upcomingPayment.amount;
        }
      }
    });
    
    return nextPayment;
  }
  
  /**
   * Format growth data for charts
   * @param {Array} growthData - Raw growth data
   * @returns {Object} Formatted growth data
   */
  formatGrowthData(growthData) {
    const months = [];
    const counts = [];
    
    growthData.reverse().forEach(data => {
      months.push(`${data._id.year}-${String(data._id.month).padStart(2, '0')}`);
      counts.push(data.count);
    });
    
    return { months, counts };
  }
  
  /**
   * Format statistics data
   * @param {Array} statsData - Raw statistics data
   * @returns {Object} Formatted statistics
   */
  formatStats(statsData) {
    const formatted = {};
    statsData.forEach(stat => {
      formatted[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalPremium || stat.totalClaimed || stat.totalApproved || 0
      };
    });
    return formatted;
  }
  
  /**
   * Format distribution data
   * @param {Array} distributionData - Raw distribution data
   * @returns {Object} Formatted distribution
   */
  formatDistribution(distributionData) {
    const labels = [];
    const data = [];
    
    distributionData.forEach(item => {
      labels.push(item._id);
      data.push(item.count);
    });
    
    return { labels, data };
  }
  
  /**
   * Format trend data
   * @param {Array} trendData - Raw trend data
   * @returns {Object} Formatted trend data
   */
  formatTrendData(trendData) {
    const labels = [];
    const data = [];
    
    trendData.forEach(item => {
      labels.push(`${item._id.year}-${String(item._id.month).padStart(2, '0')}`);
      data.push(item.revenue);
    });
    
    return { labels, data };
  }
  
  /**
   * Get financial reports
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} Financial report
   */
  async getFinancialReport(filters = {}) {
    try {
      const { startDate, endDate, policyType } = filters;
      
      const matchStage = {};
      
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      if (policyType) {
        matchStage['coverage.type'] = policyType;
      }
      
      const [revenue, claims, policies] = await Promise.all([
        // Revenue report
        Policy.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              totalPremium: { $sum: '$totalPremium' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        
        // Claims report
        Claim.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalClaimed: { $sum: '$claimedAmount' },
              totalApproved: { $sum: '$approvedAmount' },
              totalPaid: { $sum: '$paidAmount' }
            }
          }
        ]),
        
        // Policy type distribution
        Policy.aggregate([
          { $match: matchStage },
          { $unwind: '$coverage' },
          {
            $group: {
              _id: '$coverage.type',
              count: { $sum: 1 },
              totalPremium: { $sum: '$totalPremium' }
            }
          }
        ])
      ]);
      
      return {
        revenueReport: revenue,
        claimsReport: claims,
        policyDistribution: policies,
        summary: {
          totalRevenue: revenue.reduce((sum, item) => sum + item.totalPremium, 0),
          totalPolicies: revenue.reduce((sum, item) => sum + item.count, 0),
          totalClaims: claims.reduce((sum, item) => sum + item.count, 0),
          totalClaimed: claims.reduce((sum, item) => sum + item.totalClaimed, 0),
          totalPaid: claims.reduce((sum, item) => sum + item.totalPaid, 0)
        }
      };
    } catch (error) {
      logger.error(`Get financial report error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();