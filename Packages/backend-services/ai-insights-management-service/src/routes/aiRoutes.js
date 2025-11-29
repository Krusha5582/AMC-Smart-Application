const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// AI Analysis Routes
router.get('/analysis', aiController.getAnalysis);
router.get('/zones', aiController.getZones);
router.get('/history', aiController.getHistory);
router.get('/zones/:zoneId/stats', aiController.getZoneStats);

module.exports = router;
