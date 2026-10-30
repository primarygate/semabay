import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:43127/marriage/';
const OUT = '/tmp/cursor/artifacts';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,900'],
  defaultViewport: { width: 1280, height: 900 },
});

const page = await browser.newPage();
const uid = 'verify_uid_' + Date.now().toString(36);

await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate((id) => localStorage.setItem('semabay_mm_uid_v1', id), uid);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('.mm-card');

await page.screenshot({ path: path.join(OUT, '01-members.png'), fullPage: false });

await page.click('.mm-card');
await page.waitForSelector('#mmViewer:not([hidden])');
await page.waitForSelector('#mmChatBtn');
await page.screenshot({ path: path.join(OUT, '02-profile.png'), fullPage: false });

await page.click('#mmChatBtn');
await page.waitForFunction(() => {
  const c = document.getElementById('mmChat');
  return c && !c.hidden;
});
await page.waitForSelector('#mmcInput:not([disabled])');

const msg = 'Assalamu alaikum, I would like to know you better.';
await page.focus('#mmcInput');
await page.type('#mmcInput', msg, { delay: 15 });
const saveWait = page.waitForResponse(
  (r) => r.url().includes('/api/chats/') && r.request().method() === 'PUT' && r.ok(),
  { timeout: 15000 },
);
await page.click('.mc-send');
await page.waitForFunction((text) => {
  const body = document.getElementById('mmcBody');
  return body && body.textContent.includes(text);
}, {}, msg);
await saveWait;

await page.screenshot({ path: path.join(OUT, '03-chat-sent.png'), fullPage: false });

await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('.mm-card');
await page.waitForFunction(() => {
  const b = document.getElementById('mcLaunch');
  return b && !b.hidden;
}, { timeout: 15000 });

await page.click('#mcLaunch');
await page.waitForFunction(() => {
  const c = document.getElementById('mmChat');
  return c && !c.hidden;
});
await page.waitForSelector('.mc-item');
await page.click('.mc-item');
await page.waitForFunction((text) => {
  const body = document.getElementById('mmcBody');
  const list = document.getElementById('mcList');
  return body && body.textContent.includes(text) && list && /You:/.test(list.textContent);
}, { timeout: 15000 }, msg);

await page.screenshot({ path: path.join(OUT, '04-chat-after-reload.png'), fullPage: false });

const persisted = await page.evaluate(() => {
  const body = document.getElementById('mmcBody')?.textContent || '';
  const list = document.getElementById('mcList')?.textContent || '';
  return { body, list };
});

const api = await fetch('http://127.0.0.1:43127/api/chats', {
  headers: { 'X-MM-User': uid },
}).then((r) => r.json());

console.log(JSON.stringify({
  ok: true,
  uid,
  threadCount: Object.keys(api.threads || {}).length,
  messagePreview: Object.values(api.threads || {})[0]?.msgs?.[0]?.t,
  uiHasMessage: persisted.body.includes(msg),
  listHasYou: persisted.list.includes('You:'),
  shots: [
    path.join(OUT, '01-members.png'),
    path.join(OUT, '02-profile.png'),
    path.join(OUT, '03-chat-sent.png'),
    path.join(OUT, '04-chat-after-reload.png'),
  ],
}, null, 2));

await browser.close();
