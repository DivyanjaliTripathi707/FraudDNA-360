const AlertModel = require('../../models/alertModel');
const InvestigationModel = require('../../models/investigationModel');

class ResponseService {
  static async getAlerts() {
    return await AlertModel.getAll();
  }

  static async createAlert(data) {
    return await AlertModel.create(data);
  }

  static async getInvestigations() {
    return await InvestigationModel.getAll();
  }

  static async createInvestigation(data) {
    return await InvestigationModel.create(data);
  }

  static async updateInvestigation(id, updates) {
    return await InvestigationModel.update(id, updates);
  }

  static async generateHighPriorityLead(alertId) {
    const alert = await AlertModel.getById(alertId);
    return {
      alertId: alert ? alert.id : 1,
      alertRef: alert ? alert.alert_ref : 'ALT-2026-9001',
      title: alert ? alert.title : 'CRITICAL FRAUD NETWORK',
      location: alert ? alert.location_name : 'ATM Cluster A',
      predictedTime: alert ? alert.predicted_time : '18:00 - 21:00',
      riskScore: alert ? alert.risk_score : 89,
      confidence: alert ? alert.confidence : 92,
      recommendedLead: 'Trace connected mule accounts ACC-44102-MULE-A through D. Request physical surveillance or CCTV footage review at ATM Cluster A during predicted window 18:00 - 21:00.',
      actionItems: [
        'Place administrative monitoring lock on primary mule account ACC-44102-MULE-A',
        'Issue high-priority field alert for ATM Cluster A - North Hub',
        'Share graph network trace digest with cybercrime division'
      ]
    };
  }
}

module.exports = ResponseService;
