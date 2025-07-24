const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure /data directory exists in production (Render)
if (process.env.NODE_ENV === 'production') {
  try {
    if (!fs.existsSync('/data')) {
      fs.mkdirSync('/data');
      console.log('📂 /data directory created');
    } else {
      console.log('📂 /data directory already exists');
    }
  } catch (err) {
    console.error('❌ Failed to create /data directory:', err.message);
  }
}

// Resolve DB path
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/submissions.db'
  : path.join(__dirname, 'submissions.db');

console.log('📁 Using database path:', dbPath);

// Connect to the SQLite database
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
