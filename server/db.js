const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'ahc.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initialize() {
  const conn = getDb();

  conn.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      caption TEXT DEFAULT '',
      category TEXT DEFAULT 'General',
      sort_order INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      author_initials TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      text TEXT NOT NULL,
      source TEXT DEFAULT 'Google Review',
      is_visible INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      label TEXT DEFAULT '',
      value TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const adminCount = conn.prepare('SELECT COUNT(*) as count FROM admins').get();
  if (adminCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    conn.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hash);
    console.log('Default admin created (username: admin, password: admin123)');
  }

  const contactCount = conn.prepare('SELECT COUNT(*) as count FROM contact_info').get();
  if (contactCount.count === 0) {
    const insertContact = conn.prepare('INSERT INTO contact_info (type, label, value, sort_order) VALUES (?, ?, ?, ?)');
    insertContact.run('phone', 'Main', '(800) 555-0199', 1);
    insertContact.run('email', 'General', 'info@americanhomecinemas.com', 2);
  }

  const settingsCount = conn.prepare('SELECT COUNT(*) as count FROM site_settings').get();
  if (settingsCount.count === 0) {
    const insertSetting = conn.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    insertSetting.run('hero_title', 'Your Home, <span class="accent">Elevated.</span>');
    insertSetting.run('hero_subtitle', 'We design and install custom home theater systems, smart home automation, and security solutions that transform your living space into something extraordinary.');
    insertSetting.run('hero_badge', 'Trusted Home Theater Experts');
    insertSetting.run('stat_projects', '500');
    insertSetting.run('stat_brands', '24');
    insertSetting.run('stat_years', '10');
    insertSetting.run('stat_rating', '5');
    insertSetting.run('company_name', 'American Home Cinemas');
    insertSetting.run('footer_description', 'Your trusted partner for premium home theater installations, smart home automation, and security solutions.');
    insertSetting.run('facebook_url', '#');
    insertSetting.run('instagram_url', '#');
    insertSetting.run('youtube_url', '#');
  }

  const testimonialCount = conn.prepare('SELECT COUNT(*) as count FROM testimonials').get();
  if (testimonialCount.count === 0) {
    const insertTest = conn.prepare('INSERT INTO testimonials (author_name, author_initials, rating, text, source, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    insertTest.run('Michael Johnson', 'MJ', 5, 'American Home Cinemas transformed our living room into a true cinema experience. The surround sound system is incredible \u2014 every movie night feels like we\'re at the theater. The team was professional, clean, and finished ahead of schedule.', 'Google Review', 1);
    insertTest.run('Sarah Rodriguez', 'SR', 5, 'We had smart locks, a Ring doorbell, and Nest cameras installed throughout our property. The team integrated everything seamlessly into one app. I can check on my home from anywhere. Highly recommend their security solutions!', 'Google Review', 2);
    insertTest.run('David Williams', 'DW', 5, 'Best investment we\'ve made in our home. The outdoor Sonos speaker system sounds amazing by the pool, and the Lutron lighting they installed sets the perfect mood every evening. These guys know their stuff and stand behind their work.', 'Google Review', 3);
    insertTest.run('Lisa Patel', 'LP', 5, 'From the initial consultation to the final installation, the American Home Cinemas team was exceptional. They mounted our 85-inch TV perfectly, hid all the cables, and set up our Sonos Arc system. The attention to detail was outstanding.', 'Google Review', 4);
    insertTest.run('James Carter', 'JC', 5, 'We hired American Home Cinemas to install a complete surveillance system with smart cameras around our property. The image quality is crystal clear and the night vision is phenomenal. They also set up our Ubiquiti network so everything runs flawlessly.', 'Google Review', 5);
    insertTest.run('Amanda Torres', 'AT', 5, 'I can\'t say enough great things about this company. They automated our entire home \u2014 Ecobee thermostats, Lutron shades, Sonos in every room, and a URC remote that controls it all. Our friends are always amazed when they visit. Worth every penny!', 'Google Review', 6);
  }
}

module.exports = { getDb, initialize };
