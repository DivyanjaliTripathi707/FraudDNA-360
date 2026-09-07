const db = require('../config/db');

class PredictionModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.predictions;
    }
    const [rows] = await db.getPool().execute('SELECT p.*, l.name as location_name FROM predictions p LEFT JOIN locations l ON p.location_id = l.id ORDER BY p.created_at DESC');
    return rows;
  }

  static async create(data) {
    const ref = `PRED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const factorsJson = typeof data.contributing_factors === 'string' 
      ? data.contributing_factors 
      : JSON.stringify(data.contributing_factors || []);

    if (db.isFallback()) {
      const pred = {
        id: db.memoryStore.predictions.length + 1,
        prediction_ref: ref,
        location_id: data.location_id || 1,
        atm_cluster: data.atm_cluster || 'ATM Cluster A',
        predicted_time_window: data.predicted_time_window || '18:00 - 21:00',
        confidence_score: data.confidence_score || 90,
        contributing_factors: factorsJson,
        model_version: data.model_version || 'v1.2-prototype',
        created_at: new Date().toISOString()
      };
      db.memoryStore.predictions.unshift(pred);
      return pred;
    }
    const [res] = await db.getPool().execute(
      'INSERT INTO predictions (prediction_ref, location_id, atm_cluster, predicted_time_window, confidence_score, contributing_factors, model_version) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ref, data.location_id || 1, data.atm_cluster || 'ATM Cluster A', data.predicted_time_window || '18:00 - 21:00', data.confidence_score || 90, factorsJson, data.model_version || 'v1.2-prototype']
    );
    const [rows] = await db.getPool().execute('SELECT * FROM predictions WHERE id = ?', [res.insertId]);
    return rows[0];
  }
}

module.exports = PredictionModel;
