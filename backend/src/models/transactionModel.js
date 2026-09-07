const db = require('../config/db');

class TransactionModel {
  static async getAll(filters = {}) {
    if (db.isFallback()) {
      let list = [...db.memoryStore.transactions];
      if (filters.suspicious !== undefined) {
        list = list.filter(t => t.is_suspicious === (filters.suspicious ? 1 : 0));
      }
      return list;
    }
    let sql = 'SELECT t.*, sa.account_number as source_acc, ta.account_number as target_acc FROM transactions t LEFT JOIN accounts sa ON t.source_account_id = sa.id LEFT JOIN accounts ta ON t.target_account_id = ta.id';
    const params = [];
    if (filters.suspicious !== undefined) {
      sql += ' WHERE t.is_suspicious = ?';
      params.push(filters.suspicious ? 1 : 0);
    }
    sql += ' ORDER BY t.timestamp DESC';
    const [rows] = await db.getPool().execute(sql, params);
    return rows;
  }

  static async getById(id) {
    if (db.isFallback()) {
      return db.memoryStore.transactions.find(t => t.id === parseInt(id) || t.transaction_ref === id) || null;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM transactions WHERE id = ? OR transaction_ref = ?', [id, id]);
    return rows[0] || null;
  }

  static async create(data) {
    if (db.isFallback()) {
      const newTx = {
        id: db.memoryStore.transactions.length + 5001,
        transaction_ref: data.transaction_ref || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        source_account_id: data.source_account_id,
        target_account_id: data.target_account_id,
        amount: parseFloat(data.amount),
        transaction_type: data.transaction_type || 'TRANSFER',
        status: 'COMPLETED',
        location_id: data.location_id || 1,
        atm_id: data.atm_id || null,
        timestamp: new Date().toISOString(),
        is_suspicious: data.is_suspicious ? 1 : 0,
        suspicious_reasons: data.suspicious_reasons || null
      };
      db.memoryStore.transactions.unshift(newTx);
      return newTx;
    }
    const ref = data.transaction_ref || `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const [res] = await db.getPool().execute(
      'INSERT INTO transactions (transaction_ref, source_account_id, target_account_id, amount, transaction_type, status, location_id, atm_id, is_suspicious, suspicious_reasons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ref, data.source_account_id, data.target_account_id, data.amount, data.transaction_type || 'TRANSFER', 'COMPLETED', data.location_id || 1, data.atm_id || null, data.is_suspicious ? 1 : 0, data.suspicious_reasons || null]
    );
    return this.getById(res.insertId);
  }

  static async getRecentByAccount(accountId) {
    if (db.isFallback()) {
      return db.memoryStore.transactions.filter(t => t.source_account_id === parseInt(accountId) || t.target_account_id === parseInt(accountId));
    }
    const [rows] = await db.getPool().execute(
      'SELECT * FROM transactions WHERE source_account_id = ? OR target_account_id = ? ORDER BY timestamp DESC LIMIT 20',
      [accountId, accountId]
    );
    return rows;
  }
}

module.exports = TransactionModel;
