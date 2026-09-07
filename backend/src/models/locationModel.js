const db = require('../config/db');

class LocationModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.locations;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM locations ORDER BY risk_score DESC');
    return rows;
  }

  static async getById(id) {
    if (db.isFallback()) {
      return db.memoryStore.locations.find(l => l.id === parseInt(id)) || null;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM locations WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async updateRisk(id, riskScore, riskLevel) {
    if (db.isFallback()) {
      const loc = db.memoryStore.locations.find(l => l.id === parseInt(id));
      if (loc) {
        loc.risk_score = riskScore;
        loc.risk_level = riskLevel;
      }
      return loc;
    }
    await db.getPool().execute('UPDATE locations SET risk_score = ?, risk_level = ? WHERE id = ?', [riskScore, riskLevel, id]);
    return this.getById(id);
  }
}

module.exports = LocationModel;
