const db = require('../config/db');

class NetworkModel {
  static async getAllRelationships() {
    if (db.isFallback()) {
      return db.memoryStore.network_relationships;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM network_relationships');
    return rows;
  }

  static async getRelationshipsForAccount(accountId) {
    if (db.isFallback()) {
      return db.memoryStore.network_relationships.filter(
        r => r.source_account_id === parseInt(accountId) || r.target_account_id === parseInt(accountId)
      );
    }
    const [rows] = await db.getPool().execute(
      'SELECT * FROM network_relationships WHERE source_account_id = ? OR target_account_id = ?',
      [accountId, accountId]
    );
    return rows;
  }
}

module.exports = NetworkModel;
