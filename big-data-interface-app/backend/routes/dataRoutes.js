const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// @route   GET /api/data/sensor
// @desc    Get sensor data
// @access  Private
router.get('/sensor', async (req, res) => {
  try {
    const { limit = 50, skip = 0, sensorId, type } = req.query;

    // Build query
    const query = {};
    if (sensorId) query.sensor_id = sensorId;
    if (type) query.type = type;

    console.log("DEBUG: Querying SensorData with:", JSON.stringify(query));

    // Fetch sensor data
    const sensorData = await SensorData.find(query)
      .sort({ last_updated: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    console.log(`DEBUG: Verify found ${sensorData.length} documents.`);

    res.json(sensorData);
  } catch (error) {
    console.error('Get sensor data error:', error);
    res.status(500).json({
      message: 'Server error fetching sensor data',
      error: error.message
    });
  }
});

// @route   GET /api/data/alerts
// @desc    Get alerts
// @access  Private
router.get('/alerts', async (req, res) => {
  try {
    const { limit = 50, severity, resolved } = req.query;

    // Build query
    const query = {};
    if (severity) query.severity = severity;
    if (resolved !== undefined) query.resolved = resolved === 'true';

    // Fetch alerts
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      message: 'Server error fetching alerts',
      error: error.message
    });
  }
});

// @route   GET /api/data/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const totalSensors = await SensorData.distinct('sensorId').then(ids => ids.length);
    const totalDataPoints = await SensorData.countDocuments();
    const activeAlerts = await Alert.countDocuments({ resolved: false });

    res.json({
      totalSensors,
      totalDataPoints,
      activeAlerts,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;

