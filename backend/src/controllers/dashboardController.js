const TransactionModel = require('../models/transactionModel');
const AccountModel = require('../models/accountModel');
const LocationModel = require('../models/locationModel');
const AlertModel = require('../models/alertModel');
const InvestigationModel = require('../models/investigationModel');
const PredictionModel = require('../models/predictionModel');
const RiskModel = require('../models/riskModel');

exports.getSummary = async (req, res, next) => {
  try {
    const transactions = await TransactionModel.getAll();
    const accounts = await AccountModel.getAll();
    const locations = await LocationModel.getAll();
    const alerts = await AlertModel.getAll();
    const investigations = await InvestigationModel.getAll();
    const predictions = await PredictionModel.getAll();

    const suspiciousCount = transactions.filter(t => t.is_suspicious).length;
    const muleCount = accounts.filter(a => a.status === 'MULE_SUSPECT').length;
    const highRiskLocations = locations.filter(l => l.risk_level === 'High').length;
    const openCases = investigations.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;

    // KPI Metrics
    const kpis = {
      totalTransactions: transactions.length,
      suspiciousTransactions: suspiciousCount,
      activeMuleAccounts: muleCount,
      highRiskLocations: highRiskLocations,
      activeAlerts: alerts.filter(a => a.status === 'ACTIVE').length,
      openInvestigations: openCases,
      averageRiskScore: 78
    };

    // Risk Distribution Chart Data
    const riskDistribution = [
      { name: 'Low (0-39)', count: accounts.filter(a => a.risk_score < 40).length + locations.filter(l => l.risk_score < 40).length, fill: '#10B981' },
      { name: 'Medium (40-69)', count: accounts.filter(a => a.risk_score >= 40 && a.risk_score < 70).length + locations.filter(l => l.risk_score >= 40 && l.risk_score < 70).length, fill: '#F59E0B' },
      { name: 'High (70-100)', count: accounts.filter(a => a.risk_score >= 70).length + locations.filter(l => l.risk_score >= 70).length, fill: '#EF4444' }
    ];

    // Transaction Trend (Last 7 Days / Hours)
    const transactionTrend = [
      { time: '14:00', normal: 120, suspicious: 2 },
      { time: '15:00', normal: 180, suspicious: 4 },
      { time: '16:00', normal: 210, suspicious: 8 },
      { time: '17:00', normal: 340, suspicious: 15 },
      { time: '18:00 (Structuring)', normal: 420, suspicious: 45 },
      { time: '19:00', normal: 290, suspicious: 30 },
      { time: '20:00', normal: 190, suspicious: 12 }
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
      newScore: 82,
      change: '+24 ↑',
      riskLevel: 'High',
      reason: 'Risk increased because newly detected patterns matched an existing fraud network and recent suspicious transaction activity.'
    };

    res.json({
      success: true,
      platform: 'FraudDNA 360',
      pipeline: 'PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND',
      kpis,
      charts: {
        riskDistribution,
        transactionTrend,
        locationRiskView
      },
      dynamicRiskShift,
      latestPredictions: predictions,
      recentAlerts: alerts.slice(0, 5),
      openInvestigations: investigations.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
};
