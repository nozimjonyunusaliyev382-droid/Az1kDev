// ===== Az1kDev — admin.js =====

if (!AZ1K.checkAuth()) {
  alert("Kirish taqiqlangan! Iltimos, saytdan login qiling.");
  window.location.href = '../index.html';
}

document.getElementById('adminLogout').addEventListener('click', () => {
  AZ1K.logout();
  window.location.href = '../index.html';
});

// ---- TAB NAVIGATION ----
document.querySelectorAll('.admin-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'posts')   renderAdminPosts();
    if (btn.dataset.tab === 'orders')  renderAdminOrders();
    if (btn.dataset.tab === 'plugins') renderAdminPlugins();
    if (btn.dataset.tab === 'support') renderSupportUsers();
  });
});

// ========== YANGILIKLAR ==========
function renderAdminPosts() {
  const posts = AZ1K.getPosts();
  const container = document.getElementById('adminPostsList');
  container.innerHTML = '';
  if (posts.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:14px;padding:32px;text-align:center">Hali yangilik qo\'shilmagan.<br><br>Yuqoridagi "Yangilik qo\'shish" tugmasini bosing.</div>';
    return;
  }
  posts.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'admin-post-row';
    row.style.animationDelay = (i * 0.04) + 's';

    const top = document.createElement('div');
    top.style.cssText = 'display:flex;align-items:flex-start;gap:12px';

    const info = document.createElement('div');
    info.style.flex = '1';

    const date = document.createElement('div');
    date.className = 'admin-post-date';
    date.textContent = AZ1K.formatDate(p.date) + (p.editedAt ? ' (tahrirlangan)' : '');
    info.appendChild(date);

    if (p.text) {
      const text = document.createElement('div');
      text.className = 'admin-post-text';
      text.textContent = p.text;
      info.appendChild(text);
    }
    if (p.imageUrl) {
      const img = document.createElement('img');
      img.style.cssText = 'max-width:180px;border-radius:8px;margin-top:10px;display:block';
      img.src = p.imageUrl; img.alt = 'Rasm';
      info.appendChild(img);
    }
    if (p.link) {
      const a = document.createElement('a');
      a.href = p.link; a.target = '_blank';
      a.style.cssText = 'display:inline-block;margin-top:8px;color:var(--accent2);font-size:13px;text-decoration:none';
      a.textContent = '🔗 ' + p.link;
      info.appendChild(a);
    }
    top.appendChild(info);

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;flex-shrink:0';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = '✏️ Tahrir';
    editBtn.addEventListener('click', () => openEditPost(p));
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.textContent = "🗑 O'chirish";
    delBtn.addEventListener('click', () => {
      if (confirm('"' + (p.text || 'Post').substring(0,40) + '..." o\'chirilsinmi?')) {
        AZ1K.deletePost(p.id); renderAdminPosts();
      }
    });
    actions.appendChild(delBtn);
    top.appendChild(actions);
    row.appendChild(top);
    container.appendChild(row);
  });
}

const addPostModal = document.getElementById('addPostModal');
document.getElementById('openAddPost').addEventListener('click', () => {
  document.getElementById('addPostModalTitle').textContent = '✏️ Yangilik qo\'shish';
  document.getElementById('postText').value = '';
  document.getElementById('postImage').value = '';
  document.getElementById('postLink').value = '';
  document.getElementById('editPostId').value = '';
  document.getElementById('savePost').textContent = 'Saqlash';
  addPostModal.classList.add('open');
  document.getElementById('postText').focus();
});
document.getElementById('closeAddPost').addEventListener('click', () => addPostModal.classList.remove('open'));
addPostModal.addEventListener('click', e => { if (e.target === addPostModal) addPostModal.classList.remove('open'); });

function openEditPost(post) {
  document.getElementById('addPostModalTitle').textContent = '✏️ Yangilikni tahrirlash';
  document.getElementById('postText').value = post.text || '';
  document.getElementById('postImage').value = post.imageUrl || '';
  document.getElementById('postLink').value = post.link || '';
  document.getElementById('editPostId').value = post.id;
  document.getElementById('savePost').textContent = 'Yangilash';
  addPostModal.classList.add('open');
}

document.getElementById('savePost').addEventListener('click', () => {
  const text = document.getElementById('postText').value.trim();
  const imageUrl = document.getElementById('postImage').value.trim();
  const link = document.getElementById('postLink').value.trim();
  const editId = document.getElementById('editPostId').value;
  if (!text && !imageUrl) {
    document.getElementById('postText').style.borderColor = 'var(--danger)';
    setTimeout(() => document.getElementById('postText').style.borderColor='', 1500);
    return;
  }
  if (editId) AZ1K.editPost(Number(editId), { text, imageUrl, link });
  else AZ1K.addPost({ text, imageUrl, link });
  addPostModal.classList.remove('open');
  renderAdminPosts();
});
document.getElementById('postText').addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'Enter') document.getElementById('savePost').click();
});

// ========== BOT BUYURTMALAR ==========
const STATUS_LABELS = {
  yangi: '🆕 Yangi',
  jarayonda: '⚙️ Jarayonda',
  tayyor: '✅ Tayyor',
  bekor: '❌ Bekor'
};

function renderAdminOrders() {
  const orders = AZ1K.getBotOrders();
  const container = document.getElementById('adminOrdersList');
  const badge = document.getElementById('ordersBadge');
  const navBadge = document.getElementById('navOrdersBadge');

  const newCount = orders.filter(o => o.status === 'yangi').length;
  badge.textContent = orders.length + ' ta (' + newCount + ' yangi)';
  navBadge.style.display = newCount > 0 ? 'inline' : 'none';

  container.innerHTML = '';
  if (orders.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:14px;padding:32px;text-align:center">Hali buyurtma kelmagan.</div>';
    return;
  }

  orders.forEach((o, i) => {
    const row = document.createElement('div');
    row.className = 'order-row';
    row.style.animationDelay = (i * 0.04) + 's';

    const top = document.createElement('div');
    top.className = 'order-row-top';

    const info = document.createElement('div');
    info.className = 'order-row-info';

    const name = document.createElement('div');
    name.className = 'order-name';
    name.textContent = o.name;
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'order-meta';
    meta.innerHTML =
      `<span>📱 ${o.telegram}</span>` +
      `<span>🔧 ${o.botType}</span>` +
      (o.deadline ? `<span>⏰ ${o.deadline}</span>` : '') +
      (o.budget   ? `<span>💰 ${o.budget}</span>`   : '') +
      `<span>📅 ${AZ1K.formatDate(o.date)}</span>`;
    info.appendChild(meta);

    if (o.desc) {
      const desc = document.createElement('div');
      desc.className = 'order-desc';
      desc.textContent = o.desc;
      info.appendChild(desc);
    }

    top.appendChild(info);

    // Status badge
    const statusBadge = document.createElement('span');
    statusBadge.className = `order-status status-${o.status}`;
    statusBadge.textContent = STATUS_LABELS[o.status] || o.status;
    top.appendChild(statusBadge);

    row.appendChild(top);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'order-actions';

    // Status o'zgartirish
    const sel = document.createElement('select');
    Object.entries(STATUS_LABELS).forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val; opt.textContent = label;
      if (val === o.status) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      AZ1K.updateOrderStatus(o.id, sel.value);
      renderAdminOrders();
    });
    actions.appendChild(sel);

    // Telegram yozish
    const tgBtn = document.createElement('a');
    tgBtn.href = 'https://t.me/' + o.telegram.replace('@','');
    tgBtn.target = '_blank';
    tgBtn.className = 'btn-primary';
    tgBtn.style.cssText = 'text-decoration:none;padding:8px 14px;font-size:12px';
    tgBtn.textContent = '📩 Javob berish';
    actions.appendChild(tgBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.textContent = "🗑 O'chirish";
    delBtn.addEventListener('click', () => {
      if (confirm('"' + o.name + '" buyurtmasi o\'chirilsinmi?')) {
        AZ1K.deleteOrder(o.id); renderAdminOrders();
      }
    });
    actions.appendChild(delBtn);

    row.appendChild(actions);
    container.appendChild(row);
  });
}

// ========== PLUGINS ==========
function renderAdminPlugins() {
  const plugins = AZ1K.getPlugins();
  const container = document.getElementById('adminPluginsList');
  container.innerHTML = '';
  if (plugins.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:14px;padding:32px;text-align:center">Hali plugin qo\'shilmagan.</div>';
    return;
  }
  plugins.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'admin-plugin-row';
    row.style.animationDelay = (i * 0.05) + 's';

    if (p.imageUrl) {
      const img = document.createElement('img');
      img.className = 'admin-plugin-img'; img.src = p.imageUrl; img.alt = p.name;
      img.onerror = function() { this.replaceWith(makeIcon(p.type)); };
      row.appendChild(img);
    } else row.appendChild(makeIcon(p.type));

    const info = document.createElement('div');
    info.className = 'admin-plugin-info';
    const name = document.createElement('div');
    name.className = 'admin-plugin-name'; name.textContent = p.name;
    const desc = document.createElement('div');
    desc.className = 'admin-plugin-desc'; desc.textContent = p.description || '';
    info.appendChild(name); info.appendChild(desc);
    row.appendChild(info);

    const badge = document.createElement('span');
    badge.className = `plugin-badge ${p.type === 'plugin' ? 'badge-plugin' : 'badge-zbora'}`;
    badge.textContent = p.type === 'plugin' ? 'Plugin' : 'Zbora';
    row.appendChild(badge);

    const del = document.createElement('button');
    del.className = 'btn-delete'; del.textContent = "🗑 O'chirish";
    del.addEventListener('click', () => {
      if (confirm('"' + p.name + '" o\'chirilsinmi?')) { AZ1K.deletePlugin(p.id); renderAdminPlugins(); }
    });
    row.appendChild(del);
    container.appendChild(row);
  });
}

function makeIcon(type) {
  const div = document.createElement('div');
  div.className = 'admin-plugin-icon';
  div.textContent = type === 'zbora' ? '⚡' : '🔌';
  return div;
}

const addPluginModal = document.getElementById('addPluginModal');
document.getElementById('openAddPlugin').addEventListener('click', () => addPluginModal.classList.add('open'));
document.getElementById('closeAddPlugin').addEventListener('click', () => { addPluginModal.classList.remove('open'); clearPluginForm(); });
addPluginModal.addEventListener('click', e => { if (e.target === addPluginModal) { addPluginModal.classList.remove('open'); clearPluginForm(); } });
document.getElementById('savePlugin').addEventListener('click', () => {
  const name = document.getElementById('pName').value.trim();
  if (!name) { document.getElementById('pName').style.borderColor='var(--danger)'; setTimeout(()=>document.getElementById('pName').style.borderColor='',1200); return; }
  AZ1K.addPlugin({ name, description: document.getElementById('pDesc').value.trim(), type: document.getElementById('pType').value, downloadLink: document.getElementById('pLink').value.trim(), imageUrl: document.getElementById('pImage').value.trim() });
  addPluginModal.classList.remove('open'); clearPluginForm(); renderAdminPlugins();
});
function clearPluginForm() {
  ['pName','pDesc','pLink','pImage'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pType').value = 'plugin';
}

// ========== SUPPORT ==========
let activeUser = null;

function renderSupportUsers() {
  const chats = AZ1K.getChats();
  const container = document.getElementById('supportUsers');
  const nicks = Object.keys(chats);
  let totalUnread = 0;
  nicks.forEach(n => totalUnread += (chats[n].unread || 0));
  document.getElementById('unreadBadge').textContent = totalUnread + ' yangi';
  document.getElementById('navUnread').style.display = totalUnread > 0 ? 'inline' : 'none';

  if (nicks.length === 0) { container.innerHTML = '<div class="empty-support">Hali hech kim yozmagan</div>'; return; }
  container.innerHTML = '';
  nicks.forEach(nick => {
    const chat = chats[nick];
    const last = chat.messages[chat.messages.length - 1];
    const item = document.createElement('div');
    item.className = 'user-item' + (activeUser === nick ? ' active' : '');
    const nameRow = document.createElement('div');
    nameRow.className = 'user-item-nick'; nameRow.textContent = nick;
    if (chat.unread > 0) { const dot = document.createElement('span'); dot.className = 'unread-dot'; nameRow.appendChild(dot); }
    const preview = document.createElement('div');
    preview.className = 'user-item-preview'; preview.textContent = last ? last.text : '';
    const time = document.createElement('div');
    time.className = 'user-item-time'; time.textContent = last ? AZ1K.formatDate(last.time) : '';
    item.appendChild(nameRow); item.appendChild(preview); item.appendChild(time);
    item.addEventListener('click', () => openUserChat(nick));
    container.appendChild(item);
  });
}

function openUserChat(nick) {
  activeUser = nick; AZ1K.markRead(nick);
  document.getElementById('activeChatName').textContent = '💬 ' + nick;
  document.getElementById('replyRow').style.display = 'flex';
  document.getElementById('adminReply').value = '';
  const chats = AZ1K.getChats();
  const chat = chats[nick] || { messages: [] };
  const box = document.getElementById('adminChatMessages');
  box.innerHTML = '';
  if (chat.messages.length === 0) { box.innerHTML = '<div class="admin-chat-empty">Xabar yo\'q</div>'; return; }
  chat.messages.forEach(m => {
    const div = document.createElement('div');
    div.className = `msg ${m.role === 'user' ? 'bot-msg' : 'user-msg'}`;
    const av = document.createElement('span'); av.className = 'msg-avatar'; av.textContent = m.role === 'user' ? '👤' : '🛡️';
    const bub = document.createElement('div'); bub.className = `msg-bubble ${m.role === 'admin' ? 'admin-reply-bubble' : ''}`;
    const n = document.createElement('div'); n.className = 'msg-nick'; n.textContent = m.role === 'user' ? nick : 'Admin (Siz)'; bub.appendChild(n);
    const t = document.createElement('span'); t.textContent = m.text; bub.appendChild(t);
    const ti = document.createElement('div'); ti.style.cssText = 'font-size:11px;color:var(--muted);margin-top:4px'; ti.textContent = AZ1K.formatDate(m.time); bub.appendChild(ti);
    div.appendChild(av); div.appendChild(bub); box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
  renderSupportUsers();
}

document.getElementById('sendAdminReply').addEventListener('click', sendAdminReply);
document.getElementById('adminReply').addEventListener('keydown', e => { if (e.key === 'Enter') sendAdminReply(); });
function sendAdminReply() {
  if (!activeUser) return;
  const input = document.getElementById('adminReply');
  const text = input.value.trim();
  if (!text) return;
  AZ1K.addAdminReply(activeUser, text); input.value = '';
  openUserChat(activeUser);
}

window.addEventListener('az1k_chats_updated', () => {
  if (document.getElementById('tab-support').classList.contains('active')) renderSupportUsers();
});
window.addEventListener('az1k_orders_updated', () => {
  if (document.getElementById('tab-orders').classList.contains('active')) renderAdminOrders();
  // Sidebar badge
  const newCount = AZ1K.getBotOrders().filter(o => o.status === 'yangi').length;
  document.getElementById('navOrdersBadge').style.display = newCount > 0 ? 'inline' : 'none';
});

// ========== INIT ==========
renderAdminPosts();
// Sidebar yangi buyurtmalar badge
const initNewOrders = AZ1K.getBotOrders().filter(o => o.status === 'yangi').length;
if (initNewOrders > 0) document.getElementById('navOrdersBadge').style.display = 'inline';
