const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  await page.goto('https://www.tijorifinance.com/ideas-dashboard/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Full scroll
  await page.evaluate(async () => {
    await new Promise(res => {
      let t = 0;
      const i = setInterval(() => {
        window.scrollBy(0, 600); t += 600;
        if (t >= document.body.scrollHeight) { clearInterval(i); window.scrollTo(0, 0); res(); }
      }, 100);
    });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll concalls card into view
  const divEl = await page.$('[data-slug="concalls"]');
  if (divEl) {
    await page.evaluate(e => e.scrollIntoView({ block: 'center' }), divEl);
    await new Promise(r => setTimeout(r, 800));
  }

  const info = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matches = all.filter(el =>
      el.children.length === 0 &&
      el.textContent.trim().toLowerCase() === 'concalls'
    ).map(el => ({
      tag: el.tagName,
      cls: el.className.substring(0, 40),
      parent: el.parentElement?.tagName,
      visible: el.getBoundingClientRect().height > 0,
      text: el.textContent.trim(),
    }));

    // Also check all h4 elements
    const h4s = Array.from(document.querySelectorAll('h4')).map(el => ({
      text: el.textContent.trim().substring(0, 50),
      h: el.getBoundingClientRect().height,
    }));

    return { matches, h4s: h4s.slice(0, 10) };
  });

  console.log('Matches for "concalls":', JSON.stringify(info.matches, null, 2));
  console.log('H4 elements:', JSON.stringify(info.h4s, null, 2));
  await browser.close();
})();
