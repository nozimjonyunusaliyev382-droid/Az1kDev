// ===== Az1kDev — data.js (Shared Data Store) =====

const AZ1K = {

  // ========== POSTS ==========
  getPosts() {
    try { return JSON.parse(localStorage.getItem('az1k_posts') || '[]'); }
    catch { return []; }
  },
  savePosts(posts) {
    localStorage.setItem('az1k_posts', JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('az1k_posts_updated'));
  },
  addPost(post) {
    const posts = this.getPosts();
    posts.unshift({ id: Date.now(), date: new Date().toISOString(), ...post });
    this.savePosts(posts);
  },
  editPost(id, data) {
    const posts = this.getPosts().map(p =>
      p.id === id ? { ...p, ...data, editedAt: new Date().toISOString() } : p
    );
    this.savePosts(posts);
  },
  deletePost(id) {
    const posts = this.getPosts().filter(p => p.id !== id);
    this.savePosts(posts);
  },

  // ========== PLUGINS ==========
  getPlugins() {
    try { return JSON.parse(localStorage.getItem('az1k_plugins') || '[]'); }
    catch { return []; }
  },
  savePlugins(plugins) {
    localStorage.setItem('az1k_plugins', JSON.stringify(plugins));
    window.dispatchEvent(new CustomEvent('az1k_plugins_updated'));
  },
  addPlugin(plugin) {
    const plugins = this.getPlugins();
    plugins.unshift({ id: Date.now(), date: new Date().toISOString(), ...plugin });
    this.savePlugins(plugins);
  },
  deletePlugin(id) {
    const plugins = this.getPlugins().filter(p => p.id !== id);
    this.savePlugins(plugins);
  },

  // ========== SUPPORT CHATS ==========
  getChats() {
    try { return JSON.parse(localStorage.getItem('az1k_chats') || '{}'); }
    catch { return {}; }
  },
  saveChats(chats) {
    localStorage.setItem('az1k_chats', JSON.stringify(chats));
    window.dispatchEvent(new CustomEvent('az1k_chats_updated'));
  },
  addUserMessage(nick, text) {
    const chats = this.getChats();
    if (!chats[nick]) chats[nick] = { messages: [], unread: 0 };
    chats[nick].messages.push({ role: 'user', text, time: new Date().toISOString() });
    chats[nick].unread = (chats[nick].unread || 0) + 1;
    this.saveChats(chats);
  },
  addAdminReply(nick, text) {
    const chats = this.getChats();
    if (!chats[nick]) chats[nick] = { messages: [], unread: 0 };
    chats[nick].messages.push({ role: 'admin', text, time: new Date().toISOString() });
    this.saveChats(chats);
  },
  markRead(nick) {
    const chats = this.getChats();
    if (chats[nick]) { chats[nick].unread = 0; this.saveChats(chats); }
  },

  // ========== ADMIN AUTH ==========
  ADMIN_USER: 'azimjonuzbek',
  ADMIN_PASS: 'azizbeksila01',
  checkAuth() {
    return localStorage.getItem('az1k_admin_auth') === 'yes';
  },
  login(user, pass) {
    if (user === this.ADMIN_USER && pass === this.ADMIN_PASS) {
      localStorage.setItem('az1k_admin_auth', 'yes');
      return true;
    }
    return false;
  },
  logout() {
    localStorage.removeItem('az1k_admin_auth');
  },

  // ========== HELPERS ==========
  formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
};

// ========== BOT BUYURTMALAR ==========
// (AZ1K obyektiga qo'shimcha metodlar)
Object.assign(AZ1K, {
  getBotOrders() {
    try { return JSON.parse(localStorage.getItem('az1k_bot_orders') || '[]'); }
    catch { return []; }
  },
  saveBotOrders(orders) {
    localStorage.setItem('az1k_bot_orders', JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('az1k_orders_updated'));
  },
  addBotOrder(order) {
    const orders = this.getBotOrders();
    orders.unshift({ id: Date.now(), date: new Date().toISOString(), status: 'yangi', ...order });
    this.saveBotOrders(orders);
  },
  updateOrderStatus(id, status) {
    const orders = this.getBotOrders().map(o => o.id === id ? { ...o, status } : o);
    this.saveBotOrders(orders);
  },
  deleteOrder(id) {
    const orders = this.getBotOrders().filter(o => o.id !== id);
    this.saveBotOrders(orders);
  }
});
