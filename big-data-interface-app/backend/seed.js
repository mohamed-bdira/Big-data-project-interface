const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const SensorData = require('./models/SensorData');
const Alert = require('./models/Alert');
require('dotenv').config();

const generateDummyData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Seeding Database (String Dates)...');

  // 1. Clear Data
  await User.deleteMany({});
  await SensorData.deleteMany({});
  await Alert.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);
  await User.insertMany([
    { username: 'farmer_john', password, role: 'farmer' },
    { username: 'researcher_jane', password, role: 'researcher' },
  ]);

  // 3. Create Sensor Data
  const sensorEntries = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const timeDate = new Date(now.getTime() - i * 60 * 60000); // Backwards by hour
    
    // CONVERT TO STRING HERE
    const timeString = timeDate.toISOString(); 

    const isRainy = Math.random() > 0.8;
    const diseaseRisks = ['Low', 'Moderate', 'High'];
    const risk = diseaseRisks[Math.floor(Math.random() * diseaseRisks.length)];
    
    let color = 'Green';
    if(risk === 'Moderate') color = 'Yellow';
    if(risk === 'High') color = 'Red';

    sensorEntries.push({
      sensor_id: 'SENSOR_001',
      soil_temp: (15 + Math.random() * 10).toFixed(1),
      soil_moist: (30 + Math.random() * 40).toFixed(1),
      soil_ph: (5.5 + Math.random() * 2).toFixed(1),
      av_air_temp: (20 + Math.random() * 15).toFixed(1),
      av_air_humid: (40 + Math.random() * 30).toFixed(1),
      max_wind: (5 + Math.random() * 20).toFixed(1),
      total_rain: isRainy ? (Math.random() * 50).toFixed(1) : 0,
      avg_light: (200 + Math.random() * 500).toFixed(0),
      irrigation_statu: Math.random() > 0.5 ? 'ON' : 'OFF',
      disease_risk: risk,
      farm_advisory: risk === 'High' ? 'Apply Fungicide immediately' : 'Monitor moisture levels',
      plot_summary: 'Vegetative Growth Stage',
      status_color: color,
      last_updated: timeString // Storing as String
    });
  }
  
  await SensorData.insertMany(sensorEntries.reverse());
  
  // 4. Create Alerts
  await Alert.create({ 
    severity: 'Critical', 
    message: 'High Disease Risk Detected', 
    type: 'Disease',
    timestamp: new Date() // Alerts can keep Date type or be changed similarly if needed
  });

  console.log('Database Seeded Successfully!');
  process.exit();
};

generateDummyData();