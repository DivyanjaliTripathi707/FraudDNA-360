const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const db = require('../config/db');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    let user = null;
    if (db.isFallback()) {
      user = db.memoryStore.users.find(u => u.username === username || u.email === username);
    } else {
      user = await UserModel.findByUsername(username);
    }

    // Demo fallback role matching if not found
    if (!user) {
      if (username === 'admin' || username === 'admin_investigator') {
        user = { id: 1, username: 'admin_investigator', email: 'investigator@frauddna360.io', role: 'Investigator', full_name: 'Senior Inspector Verma', badge: 'FIN-INV-9902' };
      } else if (username === 'chief_admin' || username === 'admin_official') {
        user = { id: 3, username: 'chief_admin', email: 'admin@frauddna360.io', role: 'Admin', full_name: 'Director S. Nambiar', badge: 'FIN-ADM-0001' };
      } else if (username === 'citizen' || username === 'citizen_user') {
        user = { id: 4, username: 'citizen_user', email: 'citizen@frauddna360.io', role: 'Citizen', full_name: 'Rajesh Sharma (Verified Citizen)', phone: '+91 98214 55102' };
      } else {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    }

    // Validate password
    let isValid = true;
    if (user.password_hash) {
      isValid = await bcrypt.compare(password, user.password_hash).catch(() => true);
    }
    // Allow demo standard passwords 'admin123' and 'citizen123'
    if (!isValid && (password === 'admin123' || password === 'citizen123' || password === 'demo123')) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Record login into audit log
    if (db.memoryStore && db.memoryStore.audit_logs) {
      db.memoryStore.audit_logs.unshift({
        id: db.memoryStore.audit_logs.length + 1,
        actor: user.username,
        action: 'USER_LOGIN_SUCCESS',
        target: `ROLE:${user.role}`,
        ip: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Login successful as ${user.role}`,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name || user.username,
        badge: user.badge || null,
        phone: user.phone || null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role, full_name, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = {
      id: (db.memoryStore.users.length + 1),
      username,
      email,
      password_hash,
      role: role || 'Citizen',
      full_name: full_name || username,
      phone: phone || null
    };

    if (db.isFallback()) {
      db.memoryStore.users.push(newUser);
    } else {
      await UserModel.create({ username, email, password_hash, role: role || 'Citizen' });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        full_name: newUser.full_name
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};
