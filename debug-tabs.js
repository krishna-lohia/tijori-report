const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  await page.goto('https://www.tijorifinance.com/ideas-dashboard/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

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

  for (const slug of ['demerger', 'concalls', 'margin-expansion']) {
    const info = await page.evaluate((s) => {
      const el = document.querySelector(`[data-slug="${s}"]`);
      if (!el) return { slug: s, found: false };
      const r = el.getBoundingClientRect();
      return { slug: s, tag: el.tagName, cls: el.className.substring(0, 60), children: el.children.length, h: Math.round(r.height), w: Math.round(r.width) };
    }, slug);
    console.log(JSON.stringify(info));

    const el = await page.$(`[data-slug="${slug}"]`);
    if (!el) { console.log(slug + ': no element'); continue; }

    await page.evaluate(e => e.scrollIntoView({ block: 'center' }), el);
    await new Promise(r => setTimeout(r, 300));

    try {
      await el.click();
      await new Promise(r => setTimeout(r, 800));

      await page.evaluate((tabEl) => {
        document.querySelectorAll('.__capture').forEach(e => e.classList.remove('__capture'));
        let node = tabEl.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!node) break;
          const cards = node.querySelectorAll('.card_body');
          for (const c of cards) {
            if (c.querySelector('.card_row')) { c.classList.add('__capture'); return; }
          }
          node = node.parentElement;
        }
      }, el);

      const marked = await page.$('.__capture');
      const mBox = marked ? await marked.boundingBox() : null;
      console.log(`  → marked: ${!!marked}, box: ${JSON.stringify(mBox)}`);
    } catch(e) {
      console.log(`  → click error: ${e.message}`);
    }
  }

  await browser.close();
})();
