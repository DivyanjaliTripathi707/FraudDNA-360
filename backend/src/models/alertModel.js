const db = require('../config/db');

class AlertModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.alerts;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM alerts ORDER BY created_at DESC');
    return rows;
  }

  static async getById(id) {
    if (db.isFallback()) {
      return db.memoryStore.alerts.find(a => a.id === parseInt(id) || a.alert_ref === id) || null;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM alerts WHERE id = ? OR alert_ref = ?', [id, id]);
    return rows[0] || null;
  }

  static async create(data) {
    const ref = `ALT-2026-${Math.floor(9000 + Math.random() * 999)}`;
    const reasonsJson = typeof data.reasons === 'string' ? data.reasons : JSON.stringify(data.reasons || []);

    if (db.isFallback()) {
      const alert = {
        id: db.memoryStore.alerts.length + 1,
        alert_ref: ref,
        title: data.title,
        priority: data.priority || 'HIGH',
        risk_score: data.risk_score || 85,
        confidence: data.confidence || 90,
        location_name: data.location_name || 'ATM Cluster A',
        predicted_time: data.predicted_time || '18:00 - 21:00',
        reasons: reasonsJson,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };
      db.memoryStore.alerts.unshift(alert);
      return alert;
    }
    const [res] = await db.getPool().execute(
      'INSERT INTO alerts (alert_ref, title, priority, risk_score, confidence, location_name, predicted_time, reasons, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ref, data.title, data.priority || 'HIGH', data.risk_score || 85, data.confidence || 90, data.location_name || 'ATM Cluster A', data.predicted_time || '18:00 - 21:00', reasonsJson, 'ACTIVE']
    );
    return this.getById(res.insertId);
  }
}

module.exports = AlertModel;
