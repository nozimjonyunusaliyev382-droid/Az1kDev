// ===== Az1kDev — plugins.js =====

// ---- LOGO 5x CLICK → ADMIN ----
let logoClicks = 0, logoTimer = null;
const logoTrigger = document.getElementById('logoTrigger');
logoTrigger.addEventListener('click', () => {
  logoTrigger.classList.add('flash');
  setTimeout(() => logoTrigger.classList.remove('flash'), 200);
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
  if (logoClicks >= 5) {
    logoClicks = 0;
    openAdminModal();
  }
});

// ---- ADMIN MODAL ----
const adminModal = document.getElementById('adminModal');
function openAdminModal() {
  if (AZ1K.checkAuth()) {
    window.location.href = 'admin/index.html';
    return;
  }
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
  if (AZ1K.login(u, p)) {
    adminModal.classList.remove('open');
    window.location.href = 'admin/index.html';
  } else {
    document.getElementById('loginError').textContent = "Login yoki parol noto'g'ri!";
  }
});
['adminLogin','adminPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
  });
});

// ---- SUPPORT MODAL ----
const supportModal = document.getElementById('supportModal');
document.getElementById('supportBtn').addEventListener('click', () => {
  supportModal.classList.add('open');
});
document.getElementById('closeSupport').addEventListener('click', () => {
  supportModal.classList.remove('open');
});
supportModal.addEventListener('click', e => {
  if (e.target === supportModal) supportModal.classList.remove('open');
});
adminModal.addEventListener('click', e => {
  if (e.target === adminModal) adminModal.classList.remove('open');
});

// ---- SUPPORT CHAT ----
let currentNick = '';
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
    const nickEl = document.createElement('div');
    nickEl.className = 'msg-nick';
    nickEl.textContent = role === 'admin' ? 'Admin' : nick;
    bubble.appendChild(nickEl);
  }
  const textEl = document.createElement('span');
  textEl.textContent = text;
  bubble.appendChild(textEl);
  div.appendChild(avatar);
  div.appendChild(bubble);
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

document.getElementById('sendChat').addEventListener('click', sendUserMsg);
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendUserMsg();
});

function sendUserMsg() {
  const nickInput = document.getElementById('userNick');
  const chatInput = document.getElementById('chatInput');
  const nick = nickInput.value.trim();
  const text = chatInput.value.trim();
  if (!nick) { nickInput.style.borderColor = 'var(--danger)'; setTimeout(() => nickInput.style.borderColor='',1200); return; }
  if (!text) return;
  appendChatMsg('user', nick, text);
  AZ1K.addUserMessage(nick, text);
  chatInput.value = '';
  setTimeout(() => {
    appendChatMsg('bot', '', 'Xabaringiz qabul qilindi! Admin tez orada javob beradi. 🤝');
  }, 600);
}

document.getElementById('userNick').addEventListener('blur', () => {
  const nick = document.getElementById('userNick').value.trim();
  if (!nick) return;
  currentNick = nick;
  const chats = AZ1K.getChats();
  if (chats[nick]) {
    const box = document.getElementById('chatMessages');
    const first = box.querySelector('.bot-msg');
    box.innerHTML = '';
    if (first) box.appendChild(first);
    chats[nick].messages.forEach(m => appendChatMsg(m.role, nick, m.text));
  }
});

window.addEventListener('az1k_chats_updated', () => {
  if (!currentNick) return;
  const chats = AZ1K.getChats();
  const chat = chats[currentNick];
  if (!chat) return;
  const last = chat.messages[chat.messages.length - 1];
  if (last && last.role === 'admin') appendChatMsg('admin', '', last.text);
});

// ---- PLUGINS RENDER ----
let activeFilter = 'all';

function renderPlugins() {
  const all = AZ1K.getPlugins();
  const grid = document.getElementById('pluginsGrid');
  const empty = document.getElementById('pluginsEmpty');

  const filtered = activeFilter === 'all' ? all : all.filter(p => p.type === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.querySelector('p').textContent = activeFilter === 'all'
      ? 'Hali plugin yoki zbora yo\'q. Telegram kanalidan fayl yuborilgach bu yerda ko\'rinadi.'
      : `Hali ${activeFilter === 'plugin' ? 'plugin' : 'zbora'} yo'q.`;
    grid.appendChild(empty);
    return;
  }

  grid.innerHTML = '';
  filtered.forEach((plugin, i) => {
    const card = document.createElement('div');
    card.className = 'plugin-card';
    card.style.animationDelay = (i * 0.05) + 's';

    // Image or placeholder
    if (plugin.imageUrl) {
      const img = document.createElement('img');
      img.className = 'plugin-card-img';
      img.src = plugin.imageUrl;
      img.alt = plugin.name;
      img.onerror = function() { this.replaceWith(makePlaceholder(plugin.type)); };
      card.appendChild(img);
    } else {
      card.appendChild(makePlaceholder(plugin.type));
    }

    const badge = document.createElement('span');
    badge.className = `plugin-badge ${plugin.type === 'plugin' ? 'badge-plugin' : 'badge-zbora'}`;
    badge.textContent = plugin.type === 'plugin' ? 'Plugin' : 'Zbora';
    card.appendChild(badge);

    const name = document.createElement('div');
    name.className = 'plugin-name';
    name.textContent = plugin.name;
    card.appendChild(name);

    if (plugin.description) {
      const desc = document.createElement('div');
      desc.className = 'plugin-desc';
      desc.textContent = plugin.description;
      card.appendChild(desc);
    }

    if (plugin.downloadLink) {
      const link = document.createElement('a');
      link.className = 'plugin-download';
      link.href = plugin.downloadLink;
      link.target = '_blank';
      link.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Yuklab olish`;
      card.appendChild(link);
    }

    grid.appendChild(card);
  });
}

function makePlaceholder(type) {
  const div = document.createElement('div');
  div.className = 'plugin-card-img-placeholder';
  div.textContent = type === 'zbora' ? '⚡' : '🔌';
  return div;
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderPlugins();
  });
});

window.addEventListener('az1k_plugins_updated', renderPlugins);
renderPlugins();
