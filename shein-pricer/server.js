'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

/** Loads .env next to this file; real environment variables still win. */
function loadDotEnv(file) {
  if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile(file); } catch { /* no .env file — fine */ }
    return;
  }
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return; }
  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let value = m[2];
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '');
    process.env[m[1]] = value;
  }
}

loadDotEnv(path.join(__dirname, '.env'));

const { loadConfig } = require('./lib/config');
const { createApp } = require('./lib/app');

const config = loadConfig();
const app = createApp({ config });
const server = http.createServer((req, res) => { app.handle(req, res); });
const url = `http://localhost:${config.port}`;

function openBrowser() {
  if (process.env.OPEN_BROWSER !== '1') return;
  const { spawn } = require('node:child_process');
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin' ? ['open', [url]]
      : ['xdg-open', [url]];
  try {
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    child.on('error', () => {});
    child.unref();
  } catch { /* no browser to open — fine */ }
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use — the site is probably already running: ${url}`);
    openBrowser();
    process.exit(1);
  }
  throw err;
});

server.listen(config.port, config.host, () => {
  const rate = app.settings.get().rate;
  console.log(`shein-pricer is running: ${url}   (admin: ${url}/admin)`);
  console.log('Keep this window open. Close it (or press Ctrl+C) to stop.');
  if (!config.rapidapi.key) console.warn('  ! RAPIDAPI_KEY is empty in .env — automatic prices will not work');
  if (!(rate > 0)) console.warn(`  ! SAR -> EGP rate is not set — open ${url}/admin and save it`);
  if (!config.adminPassword) console.warn('  ! ADMIN_PASSWORD is empty in .env — /admin is locked');
  openBrowser();
});

function shutdown() {
  app.flush();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
