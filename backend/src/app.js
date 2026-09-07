const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Security Middlewares & CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Basic Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Base Manifest Route
app.get('/api', (req, res) => {
  res.json({
    name: 'AI-Powered Proactive Cyber Fraud Defence & Financial Crime Intelligence Platform API',
    tagline: 'SMART PROTECTION. EARLY DETECTION. CONNECTED INTELLIGENCE. FASTER RESPONSE.',
    status: 'ONLINE',
    version: '2.0.0-enterprise',
    pipeline: 'PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND → RECOVER',
    layers: [
      { layer: 1, name: 'PREVENT', desc: 'Early Fraud Detection, Mule Account Intelligence & Phishing Threat Intelligence' },
      { layer: 2, name: 'CONNECT', desc: 'Unified Fraud Intelligence Graph, FlowScope Money Flow Tracing & Entity Resolution' },
      { layer: 3, name: 'PREDICT', desc: 'Spatio-Temporal Cash-Out Forecasting & Fraud Campaign Detection' },
      { layer: 4, name: 'EXPLAIN', desc: 'Configurable Risk Fusion Engine & Explainable Alert Cards' },
      { layer: 5, name: 'RESPOND', desc: 'Fraud Case Autopilot, Grounded AI Summaries & Evidence Package Management' },
      { layer: 6, name: 'RECOVER', desc: 'Digital Fraud Recovery Support & Simulated Authorized Partner Actions' }
    ],
    positioning: 'An AI-powered proactive fraud intelligence, detection, investigation, alerting, and authorized response platform.',
    disclaimer: '⚠ ALL BANKING AND AUTHORITY INTEGRATIONS ARE SIMULATED DEMONSTRATION RESPONSES.',
    timestamp: new Date().toISOString()
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const networkRoutes = require('./routes/networkRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const riskRoutes = require('./routes/riskRoutes');
const alertRoutes = require('./routes/alertRoutes');
const investigationRoutes = require('./routes/investigationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/detection', detectionRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/recovery', recoveryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
