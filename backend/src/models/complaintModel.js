const db = require('../config/db');

class ComplaintModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.complaints;
    }
    const [rows] = await db.getPool().execute('SELECT c.*, a.account_number FROM complaints c LEFT JOIN accounts a ON c.victim_account_id = a.id ORDER BY c.created_at DESC');
    return rows;
  }

  static async create(data) {
    const ref = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
    if (db.isFallback()) {
      const cmp = {
        id: db.memoryStore.complaints.length + 1,
        complaint_ref: ref,
        victim_account_id: data.victim_account_id,
        reported_amount: parseFloat(data.reported_amount),
        description: data.description,
        status: 'INVESTIGATING',
        location_id: data.location_id || 1,
        created_at: new Date().toISOString()
      };
      db.memoryStore.complaints.unshift(cmp);
      return cmp;
    }
    const [res] = await db.getPool().execute(
      'INSERT INTO complaints (complaint_ref, victim_account_id, reported_amount, description, status, location_id) VALUES (?, ?, ?, ?, ?, ?)',
      [ref, data.victim_account_id, data.reported_amount, data.description, 'INVESTIGATING', data.location_id || 1]
    );
    const [rows] = await db.getPool().execute('SELECT * FROM complaints WHERE id = ?', [res.insertId]);
    return rows[0];
  }
}

module.exports = ComplaintModel;
