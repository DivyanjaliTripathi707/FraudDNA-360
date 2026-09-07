const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get('/api', (req, res) => {
  res.json({
    name: 'FraudDNA 360 - Proactive Fraud Intelligence Platform API',
    status: 'ONLINE',
    version: '1.0.0',
    pipeline: 'PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND',
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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
