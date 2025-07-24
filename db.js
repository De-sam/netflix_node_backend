const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ensure DB file is stored in Render's writeable path (/data)
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/submissions.db'
  : path.join(__dirname, 'submissions.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
    
    // Create the table if it doesn't exist
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
        console.log('✅ Table "submissions" ready.');
      }
    });
  }
});

module.exports = db;
