const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  message: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', alertSchema);

