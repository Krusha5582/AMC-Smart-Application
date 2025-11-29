const aiService = require('../services/aiService');

class AIController {
  // Get AI analysis
  async getAnalysis(req, res) {
    try {
      const analysis = await aiService.performAnalysis();
      
      res.status(200).json({
        success: true,
        data: analysis,
        message: 'AI analysis completed successfully'
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to perform AI analysis'
      });
    }
  }

  // Get zones data
  async getZones(req, res) {
    try {
      const zones = await aiService.getZonesWithData();
      
      res.status(200).json({
        success: true,
        data: zones
      });
    } catch (error) {
      console.error('Error fetching zones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch zones data'
      });
    }
  }

  // Get historical analysis
  async getHistory(req, res) {
    try {
      const { limit } = req.query;
      const history = await aiService.getHistoricalAnalysis(parseInt(limit) || 30);
      
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch historical data'
      });
    }
  }

  // Get zone statistics
  async getZoneStats(req, res) {
    try {
      const { zoneId } = req.params;
      const stats = await aiService.getZoneStatistics(parseInt(zoneId));
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching zone stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch zone statistics'
      });
    }
  }
}

module.exports = new AIController();
