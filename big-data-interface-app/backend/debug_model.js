const mongoose = require('mongoose');
const SensorData = require('./models/SensorData');
require('dotenv').config();

// Use the hardcoded URI if env not working, just like server.js
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Bot:Botishere@cluster0.b7shboc.mongodb.net/smart_agri?appName=Cluster0";

async function testModel() {
    try {
        console.log("1. Connecting to: " + MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected!");

        console.log("2. Fetching via Model...");
        const data = await SensorData.find({}).limit(5);
        console.log(`3. Found ${data.length} documents.`);

        if (data.length > 0) {
            console.log("Sample:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("⚠️ Model returned no data. Checking connection...");
            const db = mongoose.connection.db;
            const cols = await db.listCollections().toArray();
            console.log("Collections in DB:", cols.map(c => c.name));
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testModel();
