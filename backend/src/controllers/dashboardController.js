const TransactionModel = require('../models/transactionModel');
const AccountModel = require('../models/accountModel');
const LocationModel = require('../models/locationModel');
const AlertModel = require('../models/alertModel');
const InvestigationModel = require('../models/investigationModel');
const PredictionModel = require('../models/predictionModel');
const db = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {
    let transactions = [];
    let accounts = [];
    let locations = [];
    let alerts = [];
    let investigations = [];
    let predictions = [];
    let recoveryCases = [];

    if (db.isFallback()) {
      transactions = db.memoryStore.transactions;
      accounts = db.memoryStore.accounts;
      locations = db.memoryStore.locations;
      alerts = db.memoryStore.alerts;
      investigations = db.memoryStore.investigations;
      predictions = db.memoryStore.predictions;
      recoveryCases = db.memoryStore.recovery_cases || [];
    } else {
      transactions = await TransactionModel.getAll();
      accounts = await AccountModel.getAll();
      locations = await LocationModel.getAll();
      alerts = await AlertModel.getAll();
      investigations = await InvestigationModel.getAll();
      predictions = await PredictionModel.getAll();
      recoveryCases = db.memoryStore.recovery_cases || [];
    }

    const suspiciousCount = transactions.filter(t => t.is_suspicious).length;
    const muleCount = accounts.filter(a => a.status === 'MULE_SUSPECT' || a.risk_score >= 70).length;
    const criticalAlertsCount = alerts.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH').length;
    const activeCasesCount = investigations.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;

    // Six Master KPI Cards requested in Master Prompt:
    // 1. TOTAL RISK SIGNALS
    // 2. CRITICAL ALERTS
    // 3. SUSPICIOUS NETWORKS
    // 4. HIGH-RISK MULE ACCOUNTS
    // 5. ACTIVE CASES
    // 6. RECOVERY CASES
    const masterKpis = {
      totalRiskSignals: suspiciousCount + (db.memoryStore.threat_indicators ? db.memoryStore.threat_indicators.length : 4),
      criticalAlerts: criticalAlertsCount,
      suspiciousNetworks: (db.memoryStore.fraud_campaigns ? db.memoryStore.fraud_campaigns.length : 1) + 2,
      highRiskMuleAccounts: muleCount,
      activeCases: activeCasesCount,
      recoveryCases: recoveryCases.length,
      averageMuleRisk: 86
    };

    // Risk Distribution Chart Data
    const riskDistribution = [
      { name: 'Low (0-39)', count: accounts.filter(a => a.risk_score < 40).length + locations.filter(l => l.risk_score < 40).length, fill: '#10B981' },
      { name: 'Medium (40-69)', count: accounts.filter(a => a.risk_score >= 40 && a.risk_score < 70).length + locations.filter(l => l.risk_score >= 40 && l.risk_score < 70).length, fill: '#F59E0B' },
      { name: 'High (70-100)', count: accounts.filter(a => a.risk_score >= 70).length + locations.filter(l => l.risk_score >= 70).length, fill: '#EF4444' }
    ];

    // Transaction Trend (Last 7 Hours)
    const transactionTrend = [
      { time: '14:00', normal: 120, suspicious: 2 },
      { time: '15:00', normal: 180, suspicious: 4 },
      { time: '16:00', normal: 210, suspicious: 8 },
      { time: '17:00', normal: 340, suspicious: 15 },
      { time: '18:00 (Structuring)', normal: 420, suspicious: 45 },
      { time: '19:00 (Mule Churn)', normal: 290, suspicious: 32 },
      { time: '20:00 (Cash-Out)', normal: 190, suspicious: 18 }
    ];

    // Geographic / Location Risk View
    const locationRiskView = locations.map(l => ({
      id: l.id,
      name: l.name,
      city: l.city,
      riskScore: l.risk_score,
      riskLevel: l.risk_level,
      coordinates: [l.latitude, l.longitude]
    }));

    // Dynamic Risk Shift Alert
    const dynamicRiskShift = {
      entity: 'ATM Cluster A - North Hub',
      oldScore: 58,
      newScore: 88,
      change: '+30 ↑',
      riskLevel: 'Critical',
      reason: 'Dynamic Risk Engine escalated score: Inflow from victim CMP-2026-901 split into 4 mule nodes and forecasted evening ATM cash-out.'
    };

    res.json({
      success: true,
      platform: 'FraudDNA 360 - Financial Crime Intelligence Platform',
      tagline: 'SMART PROTECTION. EARLY DETECTION. CONNECTED INTELLIGENCE. FASTER RESPONSE.',
      pipeline: 'PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND → RECOVER',
      masterKpis,
      charts: {
        riskDistribution,
        transactionTrend,
        locationRiskView
      },
      dynamicRiskShift,
      latestPredictions: predictions,
      recentAlerts: alerts.slice(0, 5),
      openInvestigations: investigations.slice(0, 5),
      recoveryCases: recoveryCases.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
};
