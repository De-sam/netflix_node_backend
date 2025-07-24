const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use /data in production (Render), or local path for development
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/submissions.db'
  : path.join(__dirname, 'submissions.db');

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);

    // Create the submissions table if it doesn't exist
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
