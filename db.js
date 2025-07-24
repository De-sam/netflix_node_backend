const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use /tmp in production, fallback to local path in dev
const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : __dirname;
const dbPath = path.join(dbDir, 'submissions.db');

// Create directory if it doesn't exist
fs.mkdirSync(dbDir, { recursive: true });

console.log('📁 Using database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('✅ Table "submissions" is ready.');
      }
    });
  }
});

module.exports = db;