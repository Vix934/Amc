const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    cb(null, extOk && mimeOk);
  }
});

function requireAuth(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ===== PUBLIC API — used by frontend pages =====

router.get('/gallery', (req, res) => {
  const db = getDb();
  const photos = db.prepare('SELECT * FROM gallery_photos ORDER BY sort_order ASC, created_at DESC').all();
  res.json(photos);
});

router.get('/testimonials', (req, res) => {
  const db = getDb();
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE is_visible = 1 ORDER BY sort_order ASC').all();
  res.json(testimonials);
});

router.get('/contact', (req, res) => {
  const db = getDb();
  const contacts = db.prepare('SELECT * FROM contact_info WHERE is_visible = 1 ORDER BY sort_order ASC').all();
  res.json(contacts);
});

router.get('/settings', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM site_settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

// ===== ADMIN API — requires authentication =====

// Gallery
router.post('/gallery', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const db = getDb();
  const { caption, category } = req.body;
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM gallery_photos').get();
  const sortOrder = (maxOrder.max || 0) + 1;

  const result = db.prepare(
    'INSERT INTO gallery_photos (filename, original_name, caption, category, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(req.file.filename, req.file.originalname, caption || '', category || 'General', sortOrder);

  const photo = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(result.lastInsertRowid);
  res.json(photo);
});

router.put('/gallery/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { caption, category, sort_order, is_featured } = req.body;
  const photo = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  db.prepare(
    'UPDATE gallery_photos SET caption = ?, category = ?, sort_order = ?, is_featured = ? WHERE id = ?'
  ).run(
    caption !== undefined ? caption : photo.caption,
    category !== undefined ? category : photo.category,
    sort_order !== undefined ? sort_order : photo.sort_order,
    is_featured !== undefined ? is_featured : photo.is_featured,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.put('/gallery/reorder/batch', requireAuth, (req, res) => {
  const db = getDb();
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const update = db.prepare('UPDATE gallery_photos SET sort_order = ? WHERE id = ?');
  const transaction = db.transaction((items) => {
    items.forEach(({ id, sort_order }) => {
      update.run(sort_order, id);
    });
  });
  transaction(items);
  res.json({ success: true });
});

router.delete('/gallery/:id', requireAuth, (req, res) => {
  const db = getDb();
  const photo = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  const filePath = path.join(__dirname, '..', '..', 'uploads', photo.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM gallery_photos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Testimonials
router.get('/testimonials/all', requireAuth, (req, res) => {
  const db = getDb();
  const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC').all();
  res.json(testimonials);
});

router.post('/testimonials', requireAuth, (req, res) => {
  const db = getDb();
  const { author_name, rating, text, source } = req.body;

  if (!author_name || !text) {
    return res.status(400).json({ error: 'Author name and review text are required' });
  }

  const initials = author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM testimonials').get();
  const sortOrder = (maxOrder.max || 0) + 1;

  const result = db.prepare(
    'INSERT INTO testimonials (author_name, author_initials, rating, text, source, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(author_name, initials, rating || 5, text, source || 'Google Review', sortOrder);

  const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
  res.json(testimonial);
});

router.put('/testimonials/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Testimonial not found' });

  const { author_name, rating, text, source, is_visible, sort_order } = req.body;
  const name = author_name !== undefined ? author_name : existing.author_name;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  db.prepare(
    'UPDATE testimonials SET author_name = ?, author_initials = ?, rating = ?, text = ?, source = ?, is_visible = ?, sort_order = ? WHERE id = ?'
  ).run(
    name, initials,
    rating !== undefined ? rating : existing.rating,
    text !== undefined ? text : existing.text,
    source !== undefined ? source : existing.source,
    is_visible !== undefined ? is_visible : existing.is_visible,
    sort_order !== undefined ? sort_order : existing.sort_order,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/testimonials/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Testimonial not found' });

  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Contact Info
router.get('/contact/all', requireAuth, (req, res) => {
  const db = getDb();
  const contacts = db.prepare('SELECT * FROM contact_info ORDER BY sort_order ASC').all();
  res.json(contacts);
});

router.post('/contact', requireAuth, (req, res) => {
  const db = getDb();
  const { type, label, value } = req.body;

  if (!type || !value) {
    return res.status(400).json({ error: 'Type and value are required' });
  }

  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM contact_info').get();
  const sortOrder = (maxOrder.max || 0) + 1;

  const result = db.prepare(
    'INSERT INTO contact_info (type, label, value, sort_order) VALUES (?, ?, ?, ?)'
  ).run(type, label || '', value, sortOrder);

  const contact = db.prepare('SELECT * FROM contact_info WHERE id = ?').get(result.lastInsertRowid);
  res.json(contact);
});

router.put('/contact/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM contact_info WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  const { type, label, value, is_visible, sort_order } = req.body;

  db.prepare(
    'UPDATE contact_info SET type = ?, label = ?, value = ?, is_visible = ?, sort_order = ? WHERE id = ?'
  ).run(
    type !== undefined ? type : existing.type,
    label !== undefined ? label : existing.label,
    value !== undefined ? value : existing.value,
    is_visible !== undefined ? is_visible : existing.is_visible,
    sort_order !== undefined ? sort_order : existing.sort_order,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM contact_info WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/contact/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM contact_info WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  db.prepare('DELETE FROM contact_info WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Site Settings
router.put('/settings', requireAuth, (req, res) => {
  const db = getDb();
  const upsert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?');
  const transaction = db.transaction((settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      upsert.run(key, value, value);
    });
  });
  transaction(req.body);
  res.json({ success: true });
});

module.exports = router;
