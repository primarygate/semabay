/* SEMA BAY — temporary browser store for accounts + chat (no npm / no server).
   Replace with your team's database later. */
(function (global) {
  'use strict';
  var KEY = 'semabay_mm_store_v2';

  function empty() {
    return { accounts: {}, session: null, users: {} };
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      var s = JSON.parse(raw);
      if (!s.accounts) s.accounts = {};
      if (!s.users) s.users = {};
      return s;
    } catch (e) {
      return empty();
    }
  }

  function write(store) {
    localStorage.setItem(KEY, JSON.stringify(store));
  }

  function bucket(store, loginId) {
    if (!store.users[loginId]) store.users[loginId] = { threads: {}, newChats: {} };
    if (!store.users[loginId].threads) store.users[loginId].threads = {};
    if (!store.users[loginId].newChats) store.users[loginId].newChats = {};
    return store.users[loginId];
  }

  function normalizeLoginId(raw) {
    var id = String(raw || '')
      .trim()
      .toLowerCase();
    if (!/^[a-z0-9_]{3,32}$/.test(id)) return null;
    return id;
  }

  /* Lightweight hash for preview only — not production security. */
  function hashPass(password, salt) {
    var s = salt || String(Math.random()).slice(2) + Date.now().toString(36);
    var str = s + '::' + String(password);
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    var h2 = 0;
    for (var j = str.length - 1; j >= 0; j--) {
      h2 = ((h2 << 5) - h2 + str.charCodeAt(j)) | 0;
    }
    return { salt: s, hash: (h >>> 0).toString(16) + ':' + (h2 >>> 0).toString(16) };
  }

  function checkPass(password, account) {
    if (!account) return false;
    var next = hashPass(password, account.salt);
    return next.hash === account.hash;
  }

  function currentLoginId() {
    var store = read();
    if (!store.session || !store.session.loginId) return null;
    if (!store.accounts[store.session.loginId]) return null;
    if (store.session.expires && Date.now() > store.session.expires) {
      store.session = null;
      write(store);
      return null;
    }
    return store.session.loginId;
  }

  function safeThread(t) {
    return {
      status: t.status || 'new',
      fav: !!t.fav,
      unread: t.unread || 0,
      noted: !!t.noted,
      wasStatus: t.wasStatus || null,
      at: t.at || 0,
      msgs: Array.isArray(t.msgs) ? t.msgs : [],
    };
  }

  function fail(msg, status) {
    var e = new Error(msg);
    e.status = status || 400;
    throw e;
  }

  function handle(path, method, body) {
    body = body || {};
    method = (method || 'GET').toUpperCase();
    var parts = path.replace(/^\//, '').split('/').filter(Boolean);
    var store = read();

    if (parts[0] === 'auth' && parts[1] === 'me' && method === 'GET') {
      var me = currentLoginId();
      return { user: me ? { loginId: me, name: me } : null };
    }

    if (parts[0] === 'auth' && parts[1] === 'register' && method === 'POST') {
      var loginId = normalizeLoginId(body.loginId);
      var password = String(body.password || '');
      if (!loginId) fail('Login ID must be 3–32 characters: letters, numbers, underscore.');
      if (password.length < 6) fail('Password must be at least 6 characters.');
      if (store.accounts[loginId]) fail('That login ID is already taken. Choose another or sign in.', 409);
      var cred = hashPass(password);
      store.accounts[loginId] = {
        loginId: loginId,
        salt: cred.salt,
        hash: cred.hash,
        createdAt: new Date().toISOString(),
      };
      bucket(store, loginId);
      store.session = {
        loginId: loginId,
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      write(store);
      return { user: { loginId: loginId, name: loginId }, token: 'local' };
    }

    if (parts[0] === 'auth' && parts[1] === 'login' && method === 'POST') {
      var lid = normalizeLoginId(body.loginId);
      var pass = String(body.password || '');
      if (!lid || !pass) fail('Enter your login ID and password.');
      if (!checkPass(pass, store.accounts[lid])) fail('Wrong login ID or password.', 401);
      store.session = {
        loginId: lid,
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };
      write(store);
      return { user: { loginId: lid, name: lid }, token: 'local' };
    }

    if (parts[0] === 'auth' && parts[1] === 'logout' && method === 'POST') {
      store.session = null;
      write(store);
      return { ok: true };
    }

    if (parts[0] === 'chats') {
      var uid = currentLoginId();
      if (!uid) fail('Sign in required', 401);
      var b = bucket(store, uid);

      if (method === 'GET' && parts.length === 1) {
        var threads = {};
        Object.keys(b.threads).forEach(function (id) {
          threads[id] = safeThread(b.threads[id]);
        });
        return { threads: threads, newChats: b.newChats || {} };
      }

      if (method === 'GET' && parts.length === 2) {
        var t = b.threads[parts[1]] || { status: 'new', msgs: [], unread: 0, fav: false, at: 0 };
        return { thread: safeThread(t) };
      }

      if (method === 'PUT' && parts.length === 2) {
        var memberId = parts[1];
        var prev = b.threads[memberId] || {
          status: 'new',
          msgs: [],
          unread: 0,
          fav: false,
          at: Date.now(),
        };
        var next = {
          status: ['new', 'request', 'open', 'blocked'].indexOf(body.status) >= 0 ? body.status : prev.status,
          fav: typeof body.fav === 'boolean' ? body.fav : !!prev.fav,
          unread: typeof body.unread === 'number' ? Math.max(0, body.unread | 0) : prev.unread || 0,
          noted: typeof body.noted === 'boolean' ? body.noted : !!prev.noted,
          wasStatus:
            body.wasStatus === null || typeof body.wasStatus === 'string'
              ? body.wasStatus
              : prev.wasStatus || null,
          at: prev.at || Date.now(),
          msgs: Array.isArray(body.msgs) ? body.msgs : prev.msgs || [],
        };
        if (Array.isArray(body.msgs)) {
          next.msgs = body.msgs
            .slice(-500)
            .map(function (m) {
              return {
                me: !!m.me,
                sys: !!m.sys,
                kind: m.kind || undefined,
                t: typeof m.t === 'string' ? m.t.slice(0, 2000) : undefined,
                img:
                  typeof m.img === 'string' && m.img.indexOf('data:image/') === 0
                    ? m.img.slice(0, 900000)
                    : undefined,
                at: Number(m.at) || Date.now(),
              };
            })
            .filter(function (m) {
              return m.sys || m.t || m.img;
            });
          if (next.msgs.length) next.at = next.msgs[next.msgs.length - 1].at;
        }
        b.threads[memberId] = next;
        write(store);
        return { thread: safeThread(next) };
      }

      if (method === 'POST' && parts[1] === 'meta' && parts[2] === 'new-chat') {
        var day = new Date().toISOString().slice(0, 10);
        b.newChats[day] = (b.newChats[day] || 0) + 1;
        write(store);
        return { day: day, n: b.newChats[day] };
      }

      if (method === 'DELETE' && parts.length === 1) {
        store.users[uid] = { threads: {}, newChats: {} };
        write(store);
        return { ok: true };
      }
    }

    fail('Not found', 404);
  }

  global.SBStore = {
    api: function (path, opts) {
      opts = opts || {};
      var method = opts.method || 'GET';
      var body = {};
      if (opts.body) {
        try {
          body = typeof opts.body === 'string' ? JSON.parse(opts.body) : opts.body;
        } catch (e) {
          body = {};
        }
      }
      return new Promise(function (resolve, reject) {
        try {
          resolve(handle(path, method, body));
        } catch (err) {
          reject(err);
        }
      });
    },
  };
})(window);
