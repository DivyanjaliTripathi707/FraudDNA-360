const db = require('../config/db');

class RiskModel {
  static async getHistory(entityType, entityId) {
    if (db.isFallback()) {
      return db.memoryStore.risk_scores.filter(r => r.entity_type === entityType && r.entity_id === parseInt(entityId));
    }
    const [rows] = await db.getPool().execute(
      'SELECT * FROM risk_scores WHERE entity_type = ? AND entity_id = ? ORDER BY recalculated_at DESC',
      [entityType, entityId]
    );
    return rows;
  }

  static async recordScore({ entity_type, entity_id, old_score, new_score, risk_level, confidence_score, contributing_reasons }) {
    if (db.isFallback()) {
      const record = {
        id: db.memoryStore.risk_scores.length + 1,
        entity_type,
        entity_id: parseInt(entity_id),
        old_score: parseInt(old_score),
        new_score: parseInt(new_score),
        risk_level: risk_level || (new_score >= 70 ? 'High' : new_score >= 40 ? 'Medium' : 'Low'),
        confidence_score: confidence_score || 90,
        contributing_reasons,
        recalculated_at: new Date().toISOString()
      };
      db.memoryStore.risk_scores.unshift(record);
      return record;
    }
    const level = risk_level || (new_score >= 70 ? 'High' : new_score >= 40 ? 'Medium' : 'Low');
    const [res] = await db.getPool().execute(
      'INSERT INTO risk_scores (entity_type, entity_id, old_score, new_score, risk_level, confidence_score, contributing_reasons) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [entity_type, entity_id, old_score, new_score, level, confidence_score || 90, contributing_reasons]
    );
    const [rows] = await db.getPool().execute('SELECT * FROM risk_scores WHERE id = ?', [res.insertId]);
    return rows[0];
  }
}

module.exports = RiskModel;
