const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  severity: { type: String, enum: ['Low', 'Medium', 'Critical'], required: true },
  message: String,
  type: String, // e.g., "Water Stress", "Disease Risk"
  resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', AlertSchema);