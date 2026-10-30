'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 43127;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const STORE_FILE = path.join(DATA_DIR, 'chats.json');
const SESSION_DAYS = 30;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ accounts: {}, sessions: {}, users: {} }, null, 2),
    );
  }
}

function readStore() {
  ensureStore();
  try {
    const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    if (!store.accounts) store.accounts = {};
    if (!store.sessions) store.sessions = {};
    if (!store.users) store.users = {};
    return store;
  } catch {
    return { accounts: {}, sessions: {}, users: {} };
  }
}

function writeStore(store) {
  ensureStore();
  const tmp = STORE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function userBucket(store, loginId) {
  if (!store.users[loginId]) store.users[loginId] = { threads: {}, newChats: {} };
  if (!store.users[loginId].threads) store.users[loginId].threads = {};
  if (!store.users[loginId].newChats) store.users[loginId].newChats = {};
  return store.users[loginId];
}

function json(res, status, body, extraHeaders) {
  const headers = Object.assign(
    {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    extraHeaders || {},
  );
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const limit = 2.5 * 1024 * 1024;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  raw.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function sessionCookie(token, clear) {
  if (clear) {
    return 'mm_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  }
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `mm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

function normalizeLoginId(raw) {
  const id = String(raw || '')
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(id)) return null;
  return id;
}

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), s, 32).toString('hex');
  return { salt: s, hash };
}

function checkPassword(password, account) {
  if (!account || !account.salt || !account.hash) return false;
  const next = hashPassword(password, account.salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(next.hash, 'hex'), Buffer.from(account.hash, 'hex'));
  } catch {
    return false;
  }
}

function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

function publicAccount(loginId) {
  return { loginId, name: loginId };
}

function currentUser(req, store) {
  const cookies = parseCookies(req);
  let token = cookies.mm_session || '';
  const auth = req.headers.authorization || '';
  if (!token && /^Bearer\s+/i.test(auth)) token = auth.replace(/^Bearer\s+/i, '').trim();
  const headerTok = req.headers['x-mm-session'];
  if (!token && typeof headerTok === 'string') token = headerTok.trim();
  if (!token || !store.sessions[token]) return null;
  const sess = store.sessions[token];
  if (sess.expires && Date.now() > sess.expires) {
    delete store.sessions[token];
    writeStore(store);
    return null;
  }
  if (!store.accounts[sess.loginId]) return null;
  return { loginId: sess.loginId, token };
}

function requireUser(req, store) {
  const user = currentUser(req, store);
  if (!user) {
    const err = new Error('Sign in required');
    err.status = 401;
    throw err;
  }
  return user;
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

function createSession(store, loginId) {
  const token = newToken();
  store.sessions[token] = {
    loginId,
    createdAt: Date.now(),
    expires: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  return token;
}

async function handleApi(req, res, url) {
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (req.method === 'GET' && parts[0] === 'auth' && parts[1] === 'me') {
    const store = readStore();
    const user = currentUser(req, store);
    if (!user) return json(res, 200, { user: null });
    return json(res, 200, { user: publicAccount(user.loginId) });
  }

  if (req.method === 'POST' && parts[0] === 'auth' && parts[1] === 'register') {
    const body = await readBody(req);
    const loginId = normalizeLoginId(body.loginId);
    const password = String(body.password || '');
    if (!loginId) {
      return json(res, 400, {
        error: 'Login ID must be 3–32 characters: letters, numbers, underscore.',
      });
    }
    if (password.length < 6) {
      return json(res, 400, { error: 'Password must be at least 6 characters.' });
    }
    const store = readStore();
    if (store.accounts[loginId]) {
      return json(res, 409, { error: 'That login ID is already taken. Choose another or sign in.' });
    }
    const cred = hashPassword(password);
    store.accounts[loginId] = {
      loginId,
      salt: cred.salt,
      hash: cred.hash,
      createdAt: new Date().toISOString(),
    };
    userBucket(store, loginId);
    const token = createSession(store, loginId);
    writeStore(store);
    return json(res, 201, { user: publicAccount(loginId), token }, {
      'Set-Cookie': sessionCookie(token),
    });
  }

  if (req.method === 'POST' && parts[0] === 'auth' && parts[1] === 'login') {
    const body = await readBody(req);
    const loginId = normalizeLoginId(body.loginId);
    const password = String(body.password || '');
    if (!loginId || !password) {
      return json(res, 400, { error: 'Enter your login ID and password.' });
    }
    const store = readStore();
    const account = store.accounts[loginId];
    if (!checkPassword(password, account)) {
      return json(res, 401, { error: 'Wrong login ID or password.' });
    }
    const token = createSession(store, loginId);
    writeStore(store);
    return json(res, 200, { user: publicAccount(loginId), token }, {
      'Set-Cookie': sessionCookie(token),
    });
  }

  if (req.method === 'POST' && parts[0] === 'auth' && parts[1] === 'logout') {
    const store = readStore();
    const user = currentUser(req, store);
    if (user) delete store.sessions[user.token];
    writeStore(store);
    return json(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', true) });
  }

  if (parts[0] === 'chats') {
    const store = readStore();
    const user = requireUser(req, store);
    const uid = user.loginId;

    if (req.method === 'GET' && parts.length === 1) {
      const bucket = userBucket(store, uid);
      const threads = {};
      Object.keys(bucket.threads).forEach((id) => {
        threads[id] = safeThread(bucket.threads[id]);
      });
      return json(res, 200, { threads, newChats: bucket.newChats || {} });
    }

    if (req.method === 'GET' && parts.length === 2) {
      const bucket = userBucket(store, uid);
      const t = bucket.threads[parts[1]] || {
        status: 'new',
        msgs: [],
        unread: 0,
        fav: false,
        at: 0,
      };
      return json(res, 200, { thread: safeThread(t) });
    }

    if (req.method === 'PUT' && parts.length === 2) {
      const body = await readBody(req);
      const bucket = userBucket(store, uid);
      const memberId = parts[1];
      const prev = bucket.threads[memberId] || {
        status: 'new',
        msgs: [],
        unread: 0,
        fav: false,
        at: Date.now(),
      };
      const next = {
        status: ['new', 'request', 'open', 'blocked'].includes(body.status)
          ? body.status
          : prev.status,
        fav: typeof body.fav === 'boolean' ? body.fav : !!prev.fav,
        unread:
          typeof body.unread === 'number' ? Math.max(0, body.unread | 0) : prev.unread || 0,
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
          .map((m) => ({
            me: !!m.me,
            sys: !!m.sys,
            kind: m.kind || undefined,
            t: typeof m.t === 'string' ? m.t.slice(0, 2000) : undefined,
            img:
              typeof m.img === 'string' && m.img.startsWith('data:image/')
                ? m.img.slice(0, 900000)
                : undefined,
            at: Number(m.at) || Date.now(),
          }))
          .filter((m) => m.sys || m.t || m.img);
        if (next.msgs.length) next.at = next.msgs[next.msgs.length - 1].at;
      }
      bucket.threads[memberId] = next;
      writeStore(store);
      return json(res, 200, { thread: safeThread(next) });
    }

    if (req.method === 'POST' && parts[1] === 'meta' && parts[2] === 'new-chat') {
      const bucket = userBucket(store, uid);
      const day = new Date().toISOString().slice(0, 10);
      bucket.newChats[day] = (bucket.newChats[day] || 0) + 1;
      writeStore(store);
      return json(res, 200, { day, n: bucket.newChats[day] });
    }

    if (req.method === 'DELETE' && parts.length === 1) {
      store.users[uid] = { threads: {}, newChats: {} };
      writeStore(store);
      return json(res, 200, { ok: true });
    }
  }

  return json(res, 404, { error: 'Not found' });
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control':
        ext === '.html' || ext === '.js' || ext === '.css' ? 'no-cache' : 'public, max-age=86400',
    });
    res.end(data);
  });
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(ROOT, clean);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/' || url.pathname === '') {
      res.writeHead(302, { Location: '/marriage/' });
      res.end();
      return;
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        await handleApi(req, res, url);
      } catch (e) {
        json(res, e.status || 500, { error: e.message || 'Server error' });
      }
      return;
    }

    let filePath = safePath(url.pathname);
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad path');
      return;
    }

    if (
      url.pathname.endsWith('/') ||
      (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())
    ) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    sendFile(res, filePath);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
});

ensureStore();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`SEMA BAY Marriage running at http://127.0.0.1:${PORT}/marriage/`);
});
