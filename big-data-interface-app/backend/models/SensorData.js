const mongoose  = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
    
    sensor_id: {type: String, required:true},
    soil_temp: Number,
    soil_moist: Number,
    soil_ph: Number,
    av_air_temp: Number,
    av_air_humid: Number,
    max_wind: Number,
    total_rain:{
        $numberLong: String
    },
    avg_light: Number,
    irrigation_statu: String,
    disease_risk: String,
    farm_advisory: String,
    plot_summary: String,
    status_color: String,
    last_updated: {type: String, required:true}
});

module.exports = mongoose.model('SensorData', SensorDataSchema);