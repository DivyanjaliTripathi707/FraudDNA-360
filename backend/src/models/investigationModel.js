const db = require('../config/db');

class InvestigationModel {
  static async getAll() {
    if (db.isFallback()) {
      return db.memoryStore.investigations;
    }
    const [rows] = await db.getPool().execute(
      'SELECT i.*, u.username as investigator_name, a.title as alert_title, acc.account_number FROM investigations i LEFT JOIN users u ON i.investigator_id = u.id LEFT JOIN alerts a ON i.alert_id = a.id LEFT JOIN accounts acc ON i.account_id = acc.id ORDER BY i.created_at DESC'
    );
    return rows;
  }

  static async getById(id) {
    if (db.isFallback()) {
      return db.memoryStore.investigations.find(i => i.id === parseInt(id) || i.case_ref === id) || null;
    }
    const [rows] = await db.getPool().execute('SELECT * FROM investigations WHERE id = ? OR case_ref = ?', [id, id]);
    return rows[0] || null;
  }

  static async create(data) {
    const ref = `CASE-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (db.isFallback()) {
      const inv = {
        id: db.memoryStore.investigations.length + 1,
        case_ref: ref,
        alert_id: data.alert_id || null,
        account_id: data.account_id || null,
        investigator_id: data.investigator_id || 1,
        title: data.title,
        status: data.status || 'OPEN',
        priority: data.priority || 'HIGH',
        lead_recommendation: data.lead_recommendation || 'Proceed with account monitoring.',
        notes: data.notes || '',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      db.memoryStore.investigations.unshift(inv);
      return inv;
    }
    const [res] = await db.getPool().execute(
      'INSERT INTO investigations (case_ref, alert_id, account_id, investigator_id, title, status, priority, lead_recommendation, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ref, data.alert_id || null, data.account_id || null, data.investigator_id || 1, data.title, data.status || 'OPEN', data.priority || 'HIGH', data.lead_recommendation || 'Proceed with account monitoring.', data.notes || '']
    );
    return this.getById(res.insertId);
  }

  static async update(id, { status, notes, lead_recommendation }) {
    if (db.isFallback()) {
      const inv = db.memoryStore.investigations.find(i => i.id === parseInt(id) || i.case_ref === id);
      if (inv) {
        if (status) inv.status = status;
        if (notes !== undefined) inv.notes = notes;
        if (lead_recommendation) inv.lead_recommendation = lead_recommendation;
        inv.updated_at = new Date().toISOString();
      }
      return inv;
    }
    const updates = [];
    const params = [];
    if (status) { updates.push('status = ?'); params.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (lead_recommendation) { updates.push('lead_recommendation = ?'); params.push(lead_recommendation); }
    params.push(id, id);
    await db.getPool().execute(`UPDATE investigations SET ${updates.join(', ')} WHERE id = ? OR case_ref = ?`, params);
    return this.getById(id);
  }
}

module.exports = InvestigationModel;
