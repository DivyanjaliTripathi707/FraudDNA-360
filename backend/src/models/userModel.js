const db = require('../config/db');

class UserModel {
  static async findByUsername(username) {
    if (!db.isFallback()) {
      try {
        const [rows] = await db.getPool().execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0] || null;
      } catch (err) {
        db.setFallback(true);
      }
    }
    return db.memoryStore.users.find(u => u.username === username) || null;
  }

  static async findById(id) {
    if (!db.isFallback()) {
      try {
        const [rows] = await db.getPool().execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
      } catch (err) {
        db.setFallback(true);
      }
    }
    return db.memoryStore.users.find(u => u.id === parseInt(id)) || null;
  }

  static async create({ username, email, password_hash, role }) {
    if (!db.isFallback()) {
      try {
        const [result] = await db.getPool().execute(
          'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [username, email, password_hash, role || 'Investigator']
        );
        return { id: result.insertId, username, email, role };
      } catch (err) {
        db.setFallback(true);
      }
    }
    const newUser = {
      id: db.memoryStore.users.length + 1,
      username,
      email,
      password_hash,
      role: role || 'Investigator',
      created_at: new Date().toISOString()
    };
    db.memoryStore.users.push(newUser);
    return newUser;
  }
}

module.exports = UserModel;
