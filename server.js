'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 43127;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const STORE_FILE = path.join(DATA_DIR, 'chats.json');

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
    fs.writeFileSync(STORE_FILE, JSON.stringify({ users: {} }, null, 2));
  }
}

function readStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {
    return { users: {} };
  }
}

function writeStore(store) {
  ensureStore();
  const tmp = STORE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_FILE);
}

function userBucket(store, userId) {
  if (!store.users[userId]) {
    store.users[userId] = { threads: {}, newChats: {} };
  }
  if (!store.users[userId].threads) store.users[userId].threads = {};
  if (!store.users[userId].newChats) store.users[userId].newChats = {};
  return store.users[userId];
}

function json(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(raw);
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

function userIdFrom(req) {
  const h = req.headers['x-mm-user'];
  if (typeof h === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(h)) return h;
  return 'guest';
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

async function handleApi(req, res, url) {
  const uid = userIdFrom(req);
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (req.method === 'GET' && parts[0] === 'chats' && parts.length === 1) {
    const store = readStore();
    const bucket = userBucket(store, uid);
    const threads = {};
    Object.keys(bucket.threads).forEach((id) => {
      threads[id] = safeThread(bucket.threads[id]);
    });
    return json(res, 200, { threads, newChats: bucket.newChats || {} });
  }

  if (req.method === 'GET' && parts[0] === 'chats' && parts.length === 2) {
    const memberId = parts[1];
    const store = readStore();
    const bucket = userBucket(store, uid);
    const t = bucket.threads[memberId] || { status: 'new', msgs: [], unread: 0, fav: false, at: 0 };
    return json(res, 200, { thread: safeThread(t) });
  }

  if (req.method === 'PUT' && parts[0] === 'chats' && parts.length === 2) {
    const memberId = parts[1];
    const body = await readBody(req);
    const store = readStore();
    const bucket = userBucket(store, uid);
    const prev = bucket.threads[memberId] || { status: 'new', msgs: [], unread: 0, fav: false, at: Date.now() };
    const next = {
      status: ['new', 'request', 'open', 'blocked'].includes(body.status) ? body.status : prev.status,
      fav: typeof body.fav === 'boolean' ? body.fav : !!prev.fav,
      unread: typeof body.unread === 'number' ? Math.max(0, body.unread | 0) : prev.unread || 0,
      noted: typeof body.noted === 'boolean' ? body.noted : !!prev.noted,
      wasStatus: body.wasStatus === null || typeof body.wasStatus === 'string' ? body.wasStatus : prev.wasStatus || null,
      at: prev.at || Date.now(),
      msgs: Array.isArray(body.msgs) ? body.msgs : prev.msgs || [],
    };
    if (Array.isArray(body.msgs)) {
      next.msgs = body.msgs.slice(-500).map((m) => ({
        me: !!m.me,
        sys: !!m.sys,
        kind: m.kind || undefined,
        t: typeof m.t === 'string' ? m.t.slice(0, 2000) : undefined,
        img: typeof m.img === 'string' && m.img.startsWith('data:image/') ? m.img.slice(0, 900000) : undefined,
        at: Number(m.at) || Date.now(),
      })).filter((m) => m.sys || m.t || m.img);
      if (next.msgs.length) next.at = next.msgs[next.msgs.length - 1].at;
    }
    bucket.threads[memberId] = next;
    writeStore(store);
    return json(res, 200, { thread: safeThread(next) });
  }

  if (req.method === 'POST' && parts[0] === 'chats' && parts[1] === 'meta' && parts[2] === 'new-chat') {
    const store = readStore();
    const bucket = userBucket(store, uid);
    const day = new Date().toISOString().slice(0, 10);
    bucket.newChats[day] = (bucket.newChats[day] || 0) + 1;
    writeStore(store);
    return json(res, 200, { day, n: bucket.newChats[day] });
  }

  if (req.method === 'DELETE' && parts[0] === 'chats' && parts.length === 1) {
    const store = readStore();
    store.users[uid] = { threads: {}, newChats: {} };
    writeStore(store);
    return json(res, 200, { ok: true });
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
      'Cache-Control': ext === '.html' || ext === '.js' || ext === '.css' ? 'no-cache' : 'public, max-age=86400',
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

    if (url.pathname.endsWith('/') || fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
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
