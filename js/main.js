// ===== Az1kDev — main.js (Dashboard) =====

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

// Enter key support
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

// Close modal on overlay click
supportModal.addEventListener('click', e => {
  if (e.target === supportModal) supportModal.classList.remove('open');
});
adminModal.addEventListener('click', e => {
  if (e.target === adminModal) adminModal.classList.remove('open');
});

// ---- SUPPORT CHAT LOGIC ----
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

function loadMyChat() {
  const nick = document.getElementById('userNick').value.trim();
  if (!nick) return;
  currentNick = nick;
  const chats = AZ1K.getChats();
  const chat = chats[nick];
  if (chat) {
    const box = document.getElementById('chatMessages');
    // Keep bot greeting
    const first = box.querySelector('.bot-msg');
    box.innerHTML = '';
    if (first) box.appendChild(first);
    chat.messages.forEach(m => appendChatMsg(m.role, nick, m.text));
  }
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

  if (!nick) {
    nickInput.style.borderColor = 'var(--danger)';
    setTimeout(() => nickInput.style.borderColor = '', 1200);
    return;
  }
  if (!text) return;

  appendChatMsg('user', nick, text);
  AZ1K.addUserMessage(nick, text);
  chatInput.value = '';

  // Auto reply
  setTimeout(() => {
    appendChatMsg('bot', '', 'Xabaringiz qabul qilindi! Admin tez orada javob beradi. 🤝');
  }, 600);
}

// Load chat history if nick filled
document.getElementById('userNick').addEventListener('blur', loadMyChat);

// Listen for admin replies
window.addEventListener('az1k_chats_updated', () => {
  if (!currentNick) return;
  const chats = AZ1K.getChats();
  const chat = chats[currentNick];
  if (!chat) return;

  const box = document.getElementById('chatMessages');
  const rendered = box.querySelectorAll('.msg').length;
  const total = chat.messages.length;
  // Re-render only new admin messages
  if (total > rendered - 1) {
    const last = chat.messages[chat.messages.length - 1];
    if (last.role === 'admin') {
      appendChatMsg('admin', '', last.text);
    }
  }
});

// ---- STATS & FEED ----
function renderFeed() {
  const posts = AZ1K.getPosts();
  const grid = document.getElementById('feedGrid');
  const empty = document.getElementById('emptyState');

  // Update stat
  document.getElementById('postCount').textContent = posts.length;
  document.getElementById('pluginCount').textContent = AZ1K.getPlugins().length;

  if (posts.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(empty);
    return;
  }

  grid.innerHTML = '';
  posts.forEach((post, i) => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.style.animationDelay = (i * 0.05) + 's';

    const date = document.createElement('div');
    date.className = 'post-date';
    date.textContent = AZ1K.formatDate(post.date);

    card.appendChild(date);

    if (post.text) {
      const text = document.createElement('div');
      text.className = 'post-text';
      text.textContent = post.text;
      card.appendChild(text);
    }

    if (post.imageUrl) {
      const img = document.createElement('img');
      img.className = 'post-img';
      img.src = post.imageUrl;
      img.alt = 'Post rasmi';
      card.appendChild(img);
    }

    grid.appendChild(card);
  });
}

window.addEventListener('az1k_posts_updated', renderFeed);
window.addEventListener('az1k_plugins_updated', () => {
  document.getElementById('pluginCount').textContent = AZ1K.getPlugins().length;
});

renderFeed();
