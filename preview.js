const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 700, height: 1400 });

  const htmlPath = 'file://' + path.resolve('./output/latest.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Top section
  await page.screenshot({ path: '/tmp/preview-top.png', clip: { x: 0, y: 0, width: 700, height: 1300 } });
  // Mid section (cards)
  await page.screenshot({ path: '/tmp/preview-mid.png', clip: { x: 0, y: 1300, width: 700, height: 1200 } });
  // Lower section (capex, screens)
  await page.screenshot({ path: '/tmp/preview-low.png', clip: { x: 0, y: 2500, width: 700, height: 1200 } });

  console.log('Saved all 3 previews');
  await browser.close();
})().catch(e => console.error(e.message));
