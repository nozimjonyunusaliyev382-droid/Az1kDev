# Az1kDev — O'rnatish Qo'llanmasi

## 📁 Fayl Tuzilmasi

```
az1kdev/
├── index.html          → Dashboard (bosh sahifa)
├── plugins.html        → Pluginlar & Zboralar sahifasi
├── logo.jpg            → Sayt logosi (o'zingiznikini qo'ying)
├── server.js           → Telegram webhook server (Node.js)
├── css/
│   └── style.css       → Barcha dizayn
├── js/
│   ├── data.js         → Ma'lumotlar ombori (localStorage)
│   ├── main.js         → Dashboard logikasi
│   ├── plugins.js      → Pluginlar sahifasi logikasi
│   └── admin.js        → Admin panel logikasi
└── admin/
    └── index.html      → Admin panel
```

---

## 🚀 Ishga Tushirish (2 usul)

### Usul 1 — Faqat brauzerda (hech narsasiz)
1. `index.html` ni brauzerda oching
2. Hamma narsa ishlaydi (localStorage asosida)

### Usul 2 — Telegram bilan to'liq integratsiya (server kerak)

#### 1. Telegram Bot yarating
- `@BotFather` ga yozing
- `/newbot` → bot nomi va username bering
- Token oling: `1234567890:ABCdef...`

#### 2. Bot ni kanalingizga admin qiling
- @Az1kDev kanaliga botni admin qiling
- "Post ko'rish" va "Xabarlar" ruxsatlarini bering

#### 3. Serverni o'rnating
```bash
cd az1kdev
npm install express cors
```

#### 4. `server.js` ni tahrirlang
```js
const BOT_TOKEN = 'SIZNING_BOT_TOKENINGIZ'; // shu qatorni o'zgartiring
```

#### 5. Serverni ishga tushiring
```bash
node server.js
```

#### 6. Webhook o'rnating
Serveringizni internet orqali ko'rinadigan qiling (masalan: Render, Railway, Vercel yoki VPS).
Keyin:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://SIZNING-SAYT.uz/webhook
```

---

## 🔐 Admin Panelga Kirish

Saytning chap yuqori burchagidagi **Az1kDev** logosini **5 marta tez-tez bosing**.
Login modal ochiladi:

- **Login:** `azimjonuzbek`
- **Parol:** `azizbeksila01`

---

## ⚙️ Admin Panel Imkoniyatlari

| Qism | Nima qilish mumkin |
|------|-------------------|
| Support Chatlar | Foydalanuvchilar yozgan xabarlarni ko'rish, javob berish |
| Pluginlar boshqaruvi | Plugin/Zbora qo'shish, o'chirish |
| Postlar | Telegram'dan kelgan barcha postlarni ko'rish |

---

## 📲 Telegram → Sayt (avtomatik)

| Telegram'ga nima yuborilsa | Saytda qaerda ko'rinadi |
|---------------------------|------------------------|
| Matn xabar | Dashboard → So'nggi postlar |
| Fayl (`.zip`, `.rar`) | Pluginlar & Zboralar |
| Rasm | Dashboard → postlar ichida |

**Fayl turini aniqlash:** Caption da "zbora" so'zi bo'lsa — Zbora, aks holda — Plugin deb saqlanadi.

---

## 💡 Logo qo'shish

`logo.jpg` nomli rasm faylini sayt papkasiga qo'ying. Agar yo'q bo'lsa "Az1kDev" matni ko'rinadi.

---

## 🌐 Telegram Kanal
https://t.me/Az1kDev
