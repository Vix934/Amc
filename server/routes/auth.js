const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const { getDb } = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.adminId) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, '..', '..', 'admin', 'login.html'));
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.adminId = admin.id;
  req.session.adminUser = admin.username;
  res.json({ success: true, redirect: '/admin' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, redirect: '/auth/login' });
  });
});

router.post('/change-password', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body;
  const db = getDb();

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.session.adminId);
  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hash, req.session.adminId);
  res.json({ success: true });
});

module.exports = router;
