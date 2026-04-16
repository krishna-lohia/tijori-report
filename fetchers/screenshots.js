/**
 * Tijori Ideas Dashboard — section card screenshot fetcher
 * Takes a Puppeteer screenshot of each section card (with heading) and returns base64 PNGs.
 */

const puppeteer = require('puppeteer');

const IDEAS_URL = 'https://www.tijorifinance.com/ideas-dashboard/';

const SECTIONS = [
  { slug: 'promoter-buying',           key: 'promoterBuying' },
  { slug: 'whales-buying',             key: 'whalesBuying' },
  { slug: 'rating-upgrades',           key: 'ratingUpgrades' },
  { slug: 'merger',                    key: 'merger' },
  { slug: 'demerger',                  key: 'demerger' },
  { slug: 'buyback',                   key: 'buybacks' },
  { slug: 'fund-raise',                key: 'fundRaise' },
  { slug: 'capex-announcement',        key: 'capex' },
  { slug: 'price-pessimism',           key: 'pricePessimism' },
  { slug: 'margin-expansion',          key: 'marginExpansion' },
  { slug: 'consistent-sales-growth',   key: 'consistentSales' },
  { slug: 'deleveraging',              key: 'deleveraging' },
  { slug: 'coffee-can',                key: 'coffeeCan' },
  { slug: 'upcoming-results',          key: 'upcomingResults' },
  { slug: 'concalls',                  key: 'concalls' },
  { slug: 'top-gainers',               key: 'topGainers' },
  { slug: 'top-losers',                key: 'topLosers' },
  { slug: 'trending-smallcaps',        key: 'trendingSmallcaps' },
];

async function fetchSectionScreenshots() {
  console.log('📸 Screenshotting Tijori section cards...');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  await page.goto(IDEAS_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll full page to trigger lazy-loaded sections
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, 600);
        total += 600;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Hide site-level nav and banners — but NOT card_header (inside section cards)
  await page.evaluate(() => {
    document.querySelectorAll('header, nav, .navbar, [class*="navbar"], [class*="banner"], [class*="announcement"], [class*="exchange"]')
      .forEach(el => { el.style.display = 'none'; });
  });

  const screenshots = {};

  for (const section of SECTIONS) {
    try {
      // Strategy:
      // 1. If there's a button[data-slug] → tab; click it then find visible card_body
      // 2. Else if card_body visible → use directly
      // 3. Else hidden card_body → activate via H4 click in its parent
      // 4. Walk up to card_tj (parent of card_body) for screenshot — includes section heading

      const btnEl = await page.$(`button[data-slug="${section.slug}"]`);

      let cardEl; // will always be a card_body element

      if (btnEl) {
        // Tab section — scroll button into view and click it
        await page.evaluate(e => e.scrollIntoView({ block: 'center' }), btnEl);
        await new Promise(r => setTimeout(r, 400));
        await btnEl.click();
        await new Promise(r => setTimeout(r, 1200));

        // Walk up from button to find the section container, then find visible card_body
        const cardId = await page.evaluate((btn, slug) => {
          let node = btn.parentElement;
          for (let i = 0; i < 10; i++) {
            if (!node) break;
            const cards = Array.from(node.querySelectorAll('.card_body'));
            for (const card of cards) {
              const r = card.getBoundingClientRect();
              if (r.height > 40) {
                card.setAttribute('data-capture-id', 'tijori-capture-' + slug);
                return 'tijori-capture-' + slug;
              }
            }
            node = node.parentElement;
          }
          return null;
        }, btnEl, section.slug);

        if (cardId) {
          cardEl = await page.$(`[data-capture-id="${cardId}"]`);
        }

      } else {
        // Direct card_body — check if visible
        const divEl = await page.$(`[data-slug="${section.slug}"]`);
        if (!divEl) {
          console.log(`  ⚠️  ${section.slug}: not found`);
          continue;
        }

        const h = await page.evaluate(e => e.getBoundingClientRect().height, divEl);

        if (h > 0) {
          // Already visible
          cardEl = divEl;
        } else {
          // Hidden — click the H4 inside the parent container to activate this tab
          await page.evaluate(slug => {
            const el = document.querySelector(`[data-slug="${slug}"]`);
            if (el) el.scrollIntoView({ block: 'center' });
          }, section.slug);
          await new Promise(r => setTimeout(r, 600));

          const activated = await page.evaluate(slug => {
            const cardBody = document.querySelector(`[data-slug="${slug}"]`);
            if (!cardBody) return false;
            // Walk up to find nearest ancestor with an H4, then click it
            let node = cardBody.parentElement;
            for (let i = 0; i < 8; i++) {
              if (!node) break;
              const h4 = node.querySelector('h4');
              if (h4) {
                h4.scrollIntoView({ block: 'center' });
                h4.click();
                // Also try clicking any span inside the h4
                const span = h4.querySelector('span');
                if (span) span.click();
                return true;
              }
              node = node.parentElement;
            }
            return false;
          }, section.slug);

          if (activated) {
            await new Promise(r => setTimeout(r, 1400));
            // Re-query fresh after activation
            const freshEl = await page.$(`[data-slug="${section.slug}"]`);
            if (freshEl) {
              const h2 = await page.evaluate(e => e.getBoundingClientRect().height, freshEl);
              if (h2 > 0) cardEl = freshEl;
            }
          }

          if (!cardEl) {
            console.log(`  ⚠️  ${section.slug}: hidden, could not activate`);
            continue;
          }
        }
      }

      if (!cardEl) {
        console.log(`  ⚠️  ${section.slug}: card not found`);
        continue;
      }

      // Walk up from card_body → card_tj (includes section heading "Promoter Buying" etc.)
      // card_tj is the immediate parent of card_body
      const captureHandle = await page.evaluateHandle(el => {
        const parent = el.parentElement;
        // Verify parent is card_tj (has an H4 sibling to the card_body)
        if (parent && parent.querySelector('h4')) return parent;
        return el; // fallback to card_body if structure unexpected
      }, cardEl);

      // Scroll into view and screenshot
      await page.evaluate(e => e.scrollIntoView({ block: 'center' }), captureHandle);
      await new Promise(r => setTimeout(r, 500));

      const box = await captureHandle.boundingBox();
      if (!box) {
        console.log(`  ⚠️  ${section.slug}: no bounding box`);
        continue;
      }

      const buf = await captureHandle.screenshot({ encoding: 'base64' });
      screenshots[section.key] = `data:image/png;base64,${buf}`;
      console.log(`  ✓ ${section.slug}`);

    } catch (err) {
      console.log(`  ✗ ${section.slug}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`📸 Done — ${Object.keys(screenshots).length} screenshots captured`);
  return screenshots;
}

module.exports = { fetchSectionScreenshots };
