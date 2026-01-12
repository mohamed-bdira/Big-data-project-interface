const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  sensor_id: {
    type: String,
    required: true,
    index: true,
  },
  soil_temp: Number,
  soil_moist: Number,
  soil_ph: Number,
  avg_air_temp: Number,
  avg_air_humid: Number,
  max_wind: Number,
  total_rain: Number,
  avg_light: Number,
  irrigation_status: String,
  disease_risk: String,
  farm_advisory: String,
  ai_advice: String,
  plot_summary: String,
  status_color: String,
  last_updated: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'dashboard_view',
  timestamps: false,
});

module.exports = mongoose.model('SensorData', sensorDataSchema);

