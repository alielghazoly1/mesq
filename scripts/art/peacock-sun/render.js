// node render.js in.svg out.png [scale]  — renders an SVG (with width/height attrs) to PNG with transparency
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('fs');
(async () => {
  const jobs = [];
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 3) jobs.push([args[i], args[i + 1], parseFloat(args[i + 2] || '1')]);
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  for (const [inp, out, scale] of jobs) {
    const svg = fs.readFileSync(inp, 'utf8');
    const m = svg.match(/<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/);
    const w = Math.ceil(parseFloat(m[1])), h = Math.ceil(parseFloat(m[2]));
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await page.close();
    console.log('rendered', out, w * scale, 'x', h * scale);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
