import { chromium } from 'playwright';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

// Simple static server for dist
const distDir = path.resolve(process.cwd(), 'dist');
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(4173, async () => {
  console.log('Static preview server running on http://localhost:4173');
  
  const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const viewports = [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'wide-1920', width: 1920, height: 1080 }
  ];

  for (const vp of viewports) {
    console.log(`Taking screenshot for ${vp.name}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    // Let fonts render
    await page.waitForTimeout(500);
    const outPath = path.join(screenshotsDir, `homepage-${vp.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved ${outPath}`);
  }

  // Also capture academics and menu on desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:4173/academics.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'academics-1280.png'), fullPage: true });

  await page.goto('http://localhost:4173/menu.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, 'menu-1280.png'), fullPage: true });

  await browser.close();
  server.close();
  console.log('All screenshots captured successfully.');
  process.exit(0);
});
