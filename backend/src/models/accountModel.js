const db = require('../config/db');

class AccountModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.accounts;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM accounts ORDER BY risk_score DESC');
    return rows;
  }

  static async getById(id) {
    if (db.isFallback()) {
      return db.memoryStore.accounts.find(a => a.id === parseInt(id) || a.account_number === id) || null;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM accounts WHERE id = ? OR account_number = ?', [id, id]);
    return rows[0] || null;
  }

  static async updateRiskScore(id, riskScore, status) {
    if (db.isFallback()) {
      const acc = db.memoryStore.accounts.find(a => a.id === parseInt(id) || a.account_number === id);
      if (acc) {
        acc.risk_score = riskScore;
        if (status) acc.status = status;
      }
      return acc;
    }
    const query = status 
      ? 'UPDATE accounts SET risk_score = ?, status = ? WHERE id = ? OR account_number = ?'
      : 'UPDATE accounts SET risk_score = ? WHERE id = ? OR account_number = ?';
    const params = status ? [riskScore, status, id, id] : [riskScore, id, id];
    await db.getPool().execute(query, params);
    return this.getById(id);
  }
}

module.exports = AccountModel;
