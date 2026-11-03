'use strict';

const http = require('node:http');
const path = require('node:path');

// .env next to this file (Node ≥ 20.12). Real environment variables still win.
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env file — fine */ }
}

const { loadConfig } = require('./lib/config');
const { createApp } = require('./lib/app');

const config = loadConfig();
const app = createApp({ config });
const server = http.createServer((req, res) => { app.handle(req, res); });

server.listen(config.port, config.host, () => {
  const rate = app.settings.get().rate;
  console.log(`shein-pricer: http://localhost:${config.port}`);
  if (!config.rapidapi.key) console.warn('  ! RAPIDAPI_KEY فاضي — الأسعار الأوتوماتيك مش هتشتغل');
  if (!(rate > 0)) console.warn('  ! سعر الريال متحددش — حطه في SAR_TO_EGP أو من /admin');
  if (!config.adminPassword) console.warn('  ! ADMIN_PASSWORD فاضي — /admin مقفولة');
});

function shutdown() {
  app.flush();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
