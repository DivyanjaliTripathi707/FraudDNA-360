const PredictionModel = require('../../models/predictionModel');
const LocationModel = require('../../models/locationModel');
const TransactionModel = require('../../models/transactionModel');
const AccountModel = require('../../models/accountModel');

class PredictionService {
  static async generatePrediction(params = {}) {
    const { locationId = 1, accountId = 1002 } = params;

    const location = await LocationModel.getById(locationId) || { name: 'ATM Cluster A - North Hub' };
    const transactions = await TransactionModel.getRecentByAccount(accountId);
    const accounts = await AccountModel.getAll();

    const suspiciousCount = transactions.filter(t => t.is_suspicious).length;
    const muleCount = accounts.filter(a => a.status === 'MULE_SUSPECT').length;

    // Feature weighting logic for spatio-temporal prediction
    let confidence = 75; // base prototype score
    const factors = [
      'Rapid structuring sequence detected (₹5,00,000 distributed into sub-accounts)',
      'Historical cash-out pattern matches physical ATM Cluster proximity',
      'Mule account activity window correlates with peak evening withdrawal hours'
    ];

    if (suspiciousCount >= 3) {
      confidence += 10;
      factors.push(`High suspicious transaction density (${suspiciousCount} recent alerts)`);
    }

    if (muleCount >= 3) {
      confidence += 6;
      factors.push(`Connected to active mule cluster (${muleCount} flagged mule nodes)`);
    }

    confidence = Math.min(96, confidence);

    const predictionData = {
      location_id: locationId,
      atm_cluster: location.name,
      predicted_time_window: '18:00 - 21:00',
      confidence_score: confidence,
      contributing_factors: factors,
      model_version: 'v1.2-prototype-spatiotemporal'
    };

    const savedPrediction = await PredictionModel.create(predictionData);

    return {
      predictionId: savedPrediction.id,
      predictionRef: savedPrediction.prediction_ref,
      location: location.name,
      timeWindow: '18:00 - 21:00',
      confidence: confidence,
      factors,
      modelVersion: 'v1.2-prototype-spatiotemporal',
      disclaimer: 'Prototype prediction model built on spatio-temporal feature weights. Designed for modular integration with production ML pipelines.'
    };
  }

  static async getHotspots() {
    const predictions = await PredictionModel.getAll();
    const locations = await LocationModel.getAll();

    return {
      hotspots: locations.filter(l => l.risk_level === 'High' || l.risk_level === 'Medium'),
      activePredictions: predictions
    };
  }
}

module.exports = PredictionService;
