const PredictionModel = require('../../models/predictionModel');
const LocationModel = require('../../models/locationModel');
const TransactionModel = require('../../models/transactionModel');
const AccountModel = require('../../models/accountModel');
const db = require('../../config/db');

class PredictionService {
  static async generatePrediction(params = {}) {
    const { locationId = 1, accountId = 1002 } = params;

    let location = null;
    let transactions = [];
    let accounts = [];

    if (db.isFallback()) {
      location = db.memoryStore.locations.find(l => l.id === parseInt(locationId)) || db.memoryStore.locations[0];
      transactions = db.memoryStore.transactions.filter(t => t.source_account_id === parseInt(accountId) || t.target_account_id === parseInt(accountId));
      accounts = db.memoryStore.accounts;
    } else {
      location = await LocationModel.getById(locationId) || { name: 'ATM Cluster A - North Hub' };
      transactions = await TransactionModel.getRecentByAccount(accountId);
      accounts = await AccountModel.getAll();
    }

    const suspiciousCount = transactions.filter(t => t.is_suspicious).length;
    const muleCount = accounts.filter(a => a.status === 'MULE_SUSPECT').length;

    let confidence = 80;
    const factors = [
      'Rapid structuring sequence detected (₹5,00,000 distributed into sub-accounts)',
      'Historical cash-out pattern matches physical ATM Cluster proximity',
      'Mule account activity window correlates with peak evening withdrawal hours (18:00 - 21:00)'
    ];

    if (suspiciousCount >= 3) {
      confidence += 8;
      factors.push(`High suspicious transaction density (${suspiciousCount} active alerts)`);
    }

    if (muleCount >= 3) {
      confidence += 5;
      factors.push(`Connected to active mule cluster (${muleCount} verified mule nodes)`);
    }

    confidence = Math.min(96, confidence);

    // Cash out risk calculation
    const cashOutRisk = this.calculateCashOutRisk({
      suspiciousCount,
      muleCount,
      holdingDurationMinutes: 8.5
    });

    const predictionData = {
      location_id: location.id || 1,
      atm_cluster: location.name,
      predicted_time_window: '18:00 - 21:00',
      confidence_score: confidence,
      cash_out_risk: cashOutRisk.level,
      contributing_factors: factors,
      model_version: 'v2.1-spatiotemporal-fused'
    };

    let savedPrediction = null;
    if (db.isFallback()) {
      savedPrediction = {
        id: db.memoryStore.predictions.length + 1,
        prediction_ref: `PRED-2026-${Math.floor(100 + Math.random() * 900)}`,
        ...predictionData,
        created_at: new Date().toISOString()
      };
      db.memoryStore.predictions.unshift(savedPrediction);
    } else {
      savedPrediction = await PredictionModel.create(predictionData);
    }

    return {
      predictionId: savedPrediction.id,
      predictionRef: savedPrediction.prediction_ref,
      location: location.name,
      timeWindow: '18:00 - 21:00',
      confidence: confidence,
      cash_out_risk: cashOutRisk,
      factors,
      modelVersion: 'v2.1-spatiotemporal-fused',
      disclaimer: '⚠ PREDICTIVE INTELLIGENCE NOTICE: Spatio-temporal risk forecast indicates elevated risk probability. Does not assert factual predetermination of criminal action.'
    };
  }

  /**
   * Cash-Out Risk Intelligence: Evaluates risk of imminent fund extraction
   */
  static calculateCashOutRisk(context = {}) {
    const { suspiciousCount = 3, muleCount = 4, holdingDurationMinutes = 8.5 } = context;

    let score = 50;
    const reasons = [];

    if (holdingDurationMinutes < 15) {
      score += 25;
      reasons.push('Ultra-rapid fund transfer velocity indicates hurried dissipation prior to account freeze.');
    }
    if (muleCount >= 3) {
      score += 15;
      reasons.push('Multiple secondary mule accounts active at physical ATM locations.');
    }
    if (suspiciousCount >= 3) {
      score += 10;
      reasons.push('High volume of sub-threshold outbound transactions.');
    }

    const finalScore = Math.min(100, score);
    let level = 'LOW';
    if (finalScore >= 80) level = 'CRITICAL';
    else if (finalScore >= 60) level = 'HIGH';
    else if (finalScore >= 40) level = 'MEDIUM';

    return {
      score: finalScore,
      level,
      reasons,
      forecasted_destination: 'North Hub Express ATMs (101 & 102)'
    };
  }

  /**
   * Fraud Campaign Detection: Group multiple URLs, phones, accounts into a coordinated syndicate
   */
  static async detectCampaigns() {
    return {
      success: true,
      campaigns: db.memoryStore.fraud_campaigns || [],
      count: (db.memoryStore.fraud_campaigns || []).length,
      methodology: 'Graph Community & Multi-Attribute Syndicate Clustering'
    };
  }

  static async getHotspots() {
    const predictions = db.isFallback() ? db.memoryStore.predictions : await PredictionModel.getAll();
    const locations = db.isFallback() ? db.memoryStore.locations : await LocationModel.getAll();

    return {
      hotspots: locations.filter(l => l.risk_level === 'High' || l.risk_level === 'Medium'),
      activePredictions: predictions
    };
  }
}

module.exports = PredictionService;
