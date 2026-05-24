// ===== Az1kDev — Telegram Webhook Server =====
// Bu server Telegram botdan kelgan xabarlarni saqlaydi
// va saytga avtomatik ko'rsatadi.
//
// O'rnatish:
//   npm install express node-telegram-bot-api cors
//   node server.js
//
// Keyin Telegram Bot webhook'ini o'rnating:
//   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://SIZNING-SAYT.com/webhook

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Static fayllar
app.use(express.static(path.join(__dirname)));

// ===== CONFIG =====
const BOT_TOKEN = 'TELEGRAM_BOT_TOKEN_SHU_YERGA'; // <-- O'zingizning bot tokeningizni yozing
const CHANNEL_USERNAME = '@Az1kDev';
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

// Data directory
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// DB load/save
function loadDB() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch {}
  return { posts: [], plugins: [], chats: {} };
}

function saveDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ===== TELEGRAM WEBHOOK =====
app.post('/webhook', (req, res) => {
  res.sendStatus(200);
  const update = req.body;
  if (!update) return;

  const db = loadDB();

  // Channel post
  if (update.channel_post) {
    const msg = update.channel_post;
    const post = {
      id: msg.message_id,
      date: new Date(msg.date * 1000).toISOString(),
    };

    if (msg.text) post.text = msg.text;
    if (msg.caption) post.text = msg.caption;

    // Fayl turini aniqlash
    if (msg.document) {
      post.fileType = 'document';
      post.fileName = msg.document.file_name || 'fayl';
      post.fileId = msg.document.file_id;
      post.isFile = true;

      // Plugin yoki zbora ekanini aniqlash (caption orqali)
      const cap = (msg.caption || '').toLowerCase();
      const pluginType = cap.includes('zbora') ? 'zbora' : 'plugin';

      db.plugins.unshift({
        id: Date.now(),
        name: msg.document.file_name || 'Noma\'lum',
        description: msg.caption || '',
        type: pluginType,
        date: post.date,
        tgFileId: msg.document.file_id,
        downloadLink: `https://t.me/${CHANNEL_USERNAME.replace('@','')}/${msg.message_id}`
      });
    }

    if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1];
      post.photoFileId = photo.file_id;
      post.imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/` + photo.file_id;
    }

    if (msg.video) {
      post.fileType = 'video';
      post.isFile = true;
    }

    db.posts.unshift(post);
    saveDB(db);
    console.log('✅ Kanal posti saqlandi:', post.id);
  }
});

// ===== API ENDPOINTS =====

// Barcha postlarni qaytarish
app.get('/api/posts', (req, res) => {
  const db = loadDB();
  res.json(db.posts);
});

// Barcha pluginlarni qaytarish
app.get('/api/plugins', (req, res) => {
  const db = loadDB();
  res.json(db.plugins);
});

// Plugin qo'shish (admin)
app.post('/api/plugins', (req, res) => {
  const { name, description, type, downloadLink, imageUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom kerak' });
  const db = loadDB();
  const plugin = { id: Date.now(), name, description, type: type||'plugin', downloadLink, imageUrl, date: new Date().toISOString() };
  db.plugins.unshift(plugin);
  saveDB(db);
  res.json(plugin);
});

// Plugin o'chirish (admin)
app.delete('/api/plugins/:id', (req, res) => {
  const db = loadDB();
  db.plugins = db.plugins.filter(p => p.id != req.params.id);
  saveDB(db);
  res.json({ ok: true });
});

// Support chat — xabar yuborish
app.post('/api/support/message', (req, res) => {
  const { nick, text } = req.body;
  if (!nick || !text) return res.status(400).json({ error: 'Nick va text kerak' });
  const db = loadDB();
  if (!db.chats[nick]) db.chats[nick] = { messages: [], unread: 0 };
  db.chats[nick].messages.push({ role: 'user', text, time: new Date().toISOString() });
  db.chats[nick].unread++;
  saveDB(db);
  res.json({ ok: true });
});

// Support chatlarini olish (admin)
app.get('/api/support/chats', (req, res) => {
  const db = loadDB();
  res.json(db.chats);
});

// Admin javob berish
app.post('/api/support/reply', (req, res) => {
  const { nick, text } = req.body;
  if (!nick || !text) return res.status(400).json({ error: 'Nick va text kerak' });
  const db = loadDB();
  if (!db.chats[nick]) db.chats[nick] = { messages: [], unread: 0 };
  db.chats[nick].messages.push({ role: 'admin', text, time: new Date().toISOString() });
  db.chats[nick].unread = 0;
  saveDB(db);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Az1kDev server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
});
