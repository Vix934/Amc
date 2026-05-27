const express = require('express');
const path = require('path');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.adminId) {
    return res.redirect('/auth/login');
  }
  next();
}

router.use(requireAuth);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'admin', 'dashboard.html'));
});

router.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'admin', 'gallery.html'));
});

router.get('/testimonials', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'admin', 'testimonials.html'));
});

router.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'admin', 'contact.html'));
});

router.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'admin', 'settings.html'));
});

module.exports = router;
