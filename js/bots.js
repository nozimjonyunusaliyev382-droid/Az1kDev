// ===== Az1kDev — bots.js =====

// ---- LOGO 5x CLICK → ADMIN ----
let logoClicks = 0, logoTimer = null;
const logoTrigger = document.getElementById('logoTrigger');
logoTrigger.addEventListener('click', () => {
  logoTrigger.classList.add('flash');
  setTimeout(() => logoTrigger.classList.remove('flash'), 200);
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
  if (logoClicks >= 5) { logoClicks = 0; openAdminModal(); }
});

// ---- ADMIN MODAL ----
const adminModal = document.getElementById('adminModal');
function openAdminModal() {
  if (AZ1K.checkAuth()) { window.location.href = 'admin/index.html'; return; }
  adminModal.classList.add('open');
}
document.getElementById('closeAdmin').addEventListener('click', () => {
  adminModal.classList.remove('open');
  document.getElementById('loginError').textContent = '';
  document.getElementById('adminLogin').value = '';
  document.getElementById('adminPass').value = '';
});
document.getElementById('loginBtn').addEventListener('click', () => {
  const u = document.getElementById('adminLogin').value.trim();
  const p = document.getElementById('adminPass').value.trim();
  if (AZ1K.login(u, p)) { adminModal.classList.remove('open'); window.location.href = 'admin/index.html'; }
  else document.getElementById('loginError').textContent = "Login yoki parol noto'g'ri!";
});
['adminLogin','adminPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
  });
});
adminModal.addEventListener('click', e => { if (e.target === adminModal) adminModal.classList.remove('open'); });

// ---- SUPPORT MODAL ----
const supportModal = document.getElementById('supportModal');
document.getElementById('supportBtn').addEventListener('click', () => supportModal.classList.add('open'));
document.getElementById('closeSupport').addEventListener('click', () => supportModal.classList.remove('open'));
supportModal.addEventListener('click', e => { if (e.target === supportModal) supportModal.classList.remove('open'); });

// Support chat
function appendChatMsg(role, nick, text) {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
  const avatar = document.createElement('span');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'user' ? '👤' : (role === 'admin' ? '🛡️' : '🤖');
  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${role === 'admin' ? 'admin-reply-bubble' : ''}`;
  if (role !== 'bot') {
    const n = document.createElement('div');
    n.className = 'msg-nick';
    n.textContent = role === 'admin' ? 'Admin' : nick;
    bubble.appendChild(n);
  }
  const t = document.createElement('span');
  t.textContent = text;
  bubble.appendChild(t);
  div.appendChild(avatar); div.appendChild(bubble);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
document.getElementById('sendChat').addEventListener('click', sendUserMsg);
document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMsg(); });
function sendUserMsg() {
  const nickEl = document.getElementById('userNick');
  const inputEl = document.getElementById('chatInput');
  const nick = nickEl.value.trim();
  const text = inputEl.value.trim();
  if (!nick) { nickEl.style.borderColor = 'var(--danger)'; setTimeout(() => nickEl.style.borderColor='', 1200); return; }
  if (!text) return;
  appendChatMsg('user', nick, text);
  AZ1K.addUserMessage(nick, text);
  inputEl.value = '';
  setTimeout(() => appendChatMsg('bot', '', 'Xabaringiz qabul qilindi! Admin tez orada javob beradi. 🤝'), 600);
}

// ---- BOT TYPE SELECT (kartochkalardan) ----
function selectBotType(type, label) {
  document.getElementById('orderSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    const radios = document.querySelectorAll('input[name="botType"]');
    radios.forEach(r => {
      if (r.value === label) r.checked = true;
    });
    highlightSelected();
  }, 400);
}

// Radio highlight
document.querySelectorAll('input[name="botType"]').forEach(r => {
  r.addEventListener('change', highlightSelected);
});
function highlightSelected() {
  document.querySelectorAll('.type-option').forEach(opt => {
    opt.classList.toggle('selected', opt.querySelector('input').checked);
  });
}

// Char counter
document.getElementById('oDesc').addEventListener('input', function() {
  document.getElementById('charCount').textContent = this.value.length + '/1000';
});

// ---- BUYURTMA YUBORISH ----
// MUHIM: server.js BOT_TOKEN va ADMIN_CHAT_ID ni to'ldiring
// Yoki Formspree/Telegram API dan foydalaning
// Bu yerda Telegram API orqali yuboriladi

const TELEGRAM_BOT_TOKEN = '8903179298:AAHT9Y7_5M_9yWEJdqKhRsNyuaKfXI4Sws8';  // BotFather dan oling
const ADMIN_CHAT_ID      = '7267584325'; // @userinfobot dan oling

document.getElementById('sendOrderBtn').addEventListener('click', async () => {
  const name     = document.getElementById('oName').value.trim();
  const telegram = document.getElementById('oTelegram').value.trim();
  const desc     = document.getElementById('oDesc').value.trim();
  const deadline = document.getElementById('oDeadline').value;
  const budget   = document.getElementById('oBudget').value;
  const typeEl   = document.querySelector('input[name="botType"]:checked');
  const errEl    = document.getElementById('orderError');

  errEl.textContent = '';

  if (!name) { errEl.textContent = "Ismingizni kiriting!"; document.getElementById('oName').focus(); return; }
  if (!telegram) { errEl.textContent = "Telegram username kiriting!"; document.getElementById('oTelegram').focus(); return; }
  if (!typeEl) { errEl.textContent = "Bot turini tanlang!"; return; }
  if (!desc) { errEl.textContent = "Bot haqida yozing!"; document.getElementById('oDesc').focus(); return; }

  const tgUser = telegram.startsWith('@') ? telegram : '@' + telegram;

  const message =
`🤖 <b>YANGI BOT BUYURTMA!</b>

👤 <b>Ism:</b> ${name}
📱 <b>Telegram:</b> ${tgUser}
🔧 <b>Bot turi:</b> ${typeEl.value}
📝 <b>Tavsif:</b>
${desc}
⏰ <b>Muddat:</b> ${deadline || 'Muhim emas'}
💰 <b>Byudjet:</b> ${budget || 'Kelishiladi'}

<i>Az1kDev saytidan keldi Kirish: https://az1kdev.onrender.com/admin/index.html</i>`;

  const btn = document.getElementById('sendOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Yuborilmoqda...';

  // Buyurtmani localStorage ga ham saqlaymiz (admin panel uchun)
  AZ1K.addBotOrder({ name, telegram: tgUser, botType: typeEl.value, desc, deadline, budget });

  // Telegram API orqali yuborish
  // Agar BOT_TOKEN to'ldirilmagan bo'lsa — faqat localStorage ga saqlanadi
  if (TELEGRAM_BOT_TOKEN !== 'BOT_TOKEN_SHU_YERGA' && ADMIN_CHAT_ID !== 'ADMIN_CHAT_ID_SHU_YERGA') {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: message, parse_mode: 'HTML' })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.description);
    } catch (err) {
      console.error('Telegram yuborishda xato:', err);
      // Xato bo'lsa ham saqlangan — keyinroq admin paneldan ko'radi
    }
  }

  btn.disabled = false;
  btn.textContent = 'Telegramga yuborish';

  // Success ko'rsatish
  document.getElementById('orderForm').style.display = 'none';
  document.getElementById('orderSuccess').style.display = 'block';
});

function resetForm() {
  document.getElementById('orderForm').style.display = 'block';
  document.getElementById('orderSuccess').style.display = 'none';
  document.getElementById('oName').value = '';
  document.getElementById('oTelegram').value = '';
  document.getElementById('oDesc').value = '';
  document.getElementById('oDeadline').value = '';
  document.getElementById('oBudget').value = '';
  document.getElementById('charCount').textContent = '0/1000';
  document.querySelectorAll('input[name="botType"]').forEach(r => r.checked = false);
  document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
  document.getElementById('orderError').textContent = '';
}
