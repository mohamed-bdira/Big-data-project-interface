console.log("1. Server script is STARTING..."); // If you see this, Node is working!

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Prefer environment variable, fall back to provided Atlas cluster (replace if needed)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Bot:Botishere@cluster0.b7shboc.mongodb.net/smart_agri?appName=Cluster0";

console.log("2. Connecting to Database...");

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// Routes
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes (catch-all for any unmatched /api routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      message: 'API endpoint not found',
      path: req.path
    });
  }
  next();
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://127.0.0.1:5000");
  console.log("📡 API available at http://127.0.0.1:5000/api");
});