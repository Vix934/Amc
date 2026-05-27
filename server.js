const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./server/db');
const authRoutes = require('./server/routes/auth');
const adminRoutes = require('./server/routes/admin');
const apiRoutes = require('./server/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ahc-admin-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/admin/admin.css', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'admin.css')));
app.get('/admin/components.js', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'components.js')));

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/services.html', (req, res) => res.sendFile(path.join(__dirname, 'services.html')));
app.get('/gallery.html', (req, res) => res.sendFile(path.join(__dirname, 'gallery.html')));
app.get('/testimonials.html', (req, res) => res.sendFile(path.join(__dirname, 'testimonials.html')));

db.initialize();

app.listen(PORT, () => {
  console.log(`American Home Cinemas running on http://localhost:${PORT}`);
});
