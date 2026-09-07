const db = require('../config/db');

class AtmModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.atms;
    }
    const [rows] = await db.getPool().execute('SELECT a.*, l.name as location_name FROM atms a LEFT JOIN locations l ON a.location_id = l.id');
    return rows;
  }

  static async getByLocation(locationId) {
    if (db.isFallback()) {
      return db.memoryStore.atms.filter(a => a.location_id === parseInt(locationId));
    }
    const [rows] = await db.getPool().execute('SELECT * FROM atms WHERE location_id = ?', [locationId]);
    return rows;
  }
}

module.exports = AtmModel;
