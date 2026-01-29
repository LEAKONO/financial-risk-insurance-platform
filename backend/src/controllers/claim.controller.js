const ClaimService = require('../services/claim.service');
const { logger } = require('../utils/logger.util');
class ClaimController {
  /**
   * Create a new claim
   */
  async createClaim(req, res, next) {
  try {
    const claim = await ClaimService.createClaim(req.body, req.user._id);
    
    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: claim
    });
  } catch (error) {
    logger.error(`Create claim controller error: ${error.message}`);
    
    // If you want to use next() for error handling
    // next(error);
    
    // OR keep current error response
    const status = error.message.includes('not found') ? 404 : 
                  error.message.includes('not active') ? 400 :
                  error.message.includes('exceed') ? 400 : 500;
    
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
}
  
  /**
   * Get user's claims
   */
  async getUserClaims(req, res) {
    try {
      const { page, limit, status, sortBy, sortOrder } = req.query;
      
      const result = await ClaimService.getUserClaims(req.user._id, {
        page,
        limit,
        status,
        sortBy,
        sortOrder
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Get user claims controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load claims'
      });
    }
  }
  
  /**
   * Get claim by ID
   */
  async getClaimById(req, res) {
    try {
      const claim = await ClaimService.getClaimById(req.params.id, req.user._id);
      
      res.json({
        success: true,
        data: claim
      });
    } catch (error) {
      logger.error(`Get claim by ID controller error: ${error.message}`);
      
      const status = error.message === 'Claim not found' ? 404 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Update claim status (admin/underwriter only)
   */
  async updateClaimStatus(req, res) {
    try {
      const claim = await ClaimService.updateClaimStatus(
        req.params.id,
        req.body,
        req.user._id
      );
      
      res.json({
        success: true,
        message: 'Claim status updated successfully',
        data: claim
      });
    } catch (error) {
      logger.error(`Update claim status controller error: ${error.message}`);
      
      const status = error.message === 'Claim not found' ? 404 :
                    error.message.includes('Unauthorized') ? 403 :
                    error.message.includes('Invalid status') ? 400 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Assign claim to underwriter (admin only)
   */
  async assignClaim(req, res) {
    try {
      const claim = await ClaimService.assignClaim(
        req.params.id,
        req.body.assigneeId,
        req.user._id
      );
      
      res.json({
        success: true,
        message: 'Claim assigned successfully',
        data: claim
      });
    } catch (error) {
      logger.error(`Assign claim controller error: ${error.message}`);
      
      const status = error.message === 'Claim not found' ? 404 :
                    error.message.includes('Assignee must be') ? 400 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Upload claim document
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const document = await ClaimService.uploadDocument(
        req.file,
        req.params.id,
        req.user._id
      );
      
      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    } catch (error) {
      logger.error(`Upload document controller error: ${error.message}`);
      
      const status = error.message === 'Claim not found' ? 404 :
                    error.message.includes('Unauthorized') ? 403 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Delete claim document
   */
  async deleteDocument(req, res) {
    try {
      const result = await ClaimService.deleteDocument(
        req.params.id,
        req.params.documentId,
        req.user._id
      );
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error(`Delete document controller error: ${error.message}`);
      
      const status = error.message === 'Claim not found' ? 404 :
                    error.message === 'Document not found' ? 404 :
                    error.message.includes('Unauthorized') ? 403 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * Get claim statistics
   */
  async getClaimStatistics(req, res) {
    try {
      const statistics = await ClaimService.getClaimStatistics();
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error(`Get claim statistics controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load claim statistics'
      });
    }
  }
  
  /**
   * Analyze claim for fraud (admin/underwriter only)
   */
  async analyzeFraud(req, res) {
    try {
      const claim = await ClaimService.getClaimById(req.params.id);
      
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'Claim not found'
        });
      }
      
      const indicators = await ClaimService.analyzeForFraud(claim);
      
      res.json({
        success: true,
        data: {
          claimNumber: claim.claimNumber,
          indicators,
          riskLevel: indicators.some(i => i.severity === 'high') ? 'High' :
                    indicators.some(i => i.severity === 'medium') ? 'Medium' : 'Low'
        }
      });
    } catch (error) {
      logger.error(`Analyze fraud controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze claim for fraud'
      });
    }
  }
  
  /**
   * Get admin claims view
   */
  async getAdminClaims(req, res) {
    try {
      const { 
        page, limit, status, assigneeId, startDate, endDate,
        sortBy, sortOrder, minAmount 
      } = req.query;
      
      const result = await ClaimService.getAdminClaims(
        { minAmount },
        { page, limit, status, assigneeId, startDate, endDate, sortBy, sortOrder }
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Get admin claims controller error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to load claims'
      });
    }
  }
}

module.exports = new ClaimController();