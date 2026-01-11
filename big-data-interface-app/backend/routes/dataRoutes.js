const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');

// GET /api/data/realtime (Accessible by All Authenticated Users)
router.get('/realtime', auth(), async (req, res) => {
  try {
    // Fetch last 20 records for live chart
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(20);
    res.json(data.reverse());
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/data/history (Accessible ONLY by Database Users)
// Users: agri_engineer, researcher, data_analyst
router.get('/history', auth(['agri_engineer', 'researcher', 'data_analyst']), async (req, res) => {
  try {
    const { crop, startDate, endDate } = req.query;
    let query = {};
    
    if (crop) query.cropType = crop;
    if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const data = await SensorData.find(query).sort({ timestamp: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/data/alerts
router.get('/alerts', auth(), async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;