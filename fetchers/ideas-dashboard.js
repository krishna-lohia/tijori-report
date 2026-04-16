/**
 * Tijori Ideas Dashboard scraper
 *
 * Main dashboard: gainers, losers, trending smallcaps, merger/demerger/buybacks
 * Section pages: richer detail for promoter, whales, rating, concalls, results, capex, fund-raise, social
 */

const axios   = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.tijorifinance.com/ideas-dashboard/';

const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
};

async function fetchPage(url) {
  const res = await axios.get(url, { headers: HEADERS, timeout: 25000 });
  return cheerio.load(res.data);
}

// ─── Main dashboard extractors ────────────────────────────────────────────────

function extractCards($, slug) {
  const body = $(`.card_body[data-slug="${slug}"]`);
  if (!body.length) return [];
  const items = [];
  body.find('.card_row').each((_, row) => {
    const name      = $(row).find('.card_column.left .name').text().trim();
    const ticker    = $(row).find('.card_column.left .symbol').text().trim();
    const marketCap = $(row).find('.card_column.right .market_cap span').last().text().trim() || null;
    const sector    = $(row).find('.card_column.right .sector').text().trim() || null;
    const detail    = $(row).find('.card_column.right .detail, .card_column.right .desc').text().trim() || null;
    if (name) items.push({ name, ticker, marketCap, sector, detail });
  });
  return items;
}

function extractGainersLosers($, slug) {
  const body = $(`.card_body[data-slug="${slug}"]`);
  if (!body.length) return [];
  const items = [];
  body.find('.card_row').each((_, row) => {
    const name      = $(row).find('.card_column.left .name').text().trim();
    const ticker    = $(row).find('.card_column.left .symbol').text().trim();
    const marketCap = $(row).find('.card_column.right .market_cap span').last().text().trim() || null;
    const pctText   = $(row).find('.card_column.right .change_percent').text()
                        .replace(/[^\d.\-+]/g, ' ').trim().split(/\s+/)[0];
    const pct       = parseFloat(pctText) || null;
    const isNeg     = $(row).find('.change_percent').hasClass('red');
    const signedPct = pct !== null ? (isNeg ? -Math.abs(pct) : Math.abs(pct)) : null;
    if (name) items.push({ name, ticker, marketCap, pct: signedPct });
  });
  return items;
}

function extractTrendingSmallcaps($, slug) {
  const body = $(`.card_body[data-slug="${slug}"]`);
  if (!body.length) return [];
  const items = [];
  body.find('.card_row').each((_, row) => {
    const name   = $(row).find('.card_column.left .name').text().trim();
    const ticker = $(row).find('.card_column.left .symbol').text().trim();
    const score  = parseInt($(row).find('.card_column.right .red_flag span').text().trim()) || null;
    if (name) items.push({ name, ticker, score });
  });
  return items;
}

// ─── Shared: extract company name / ticker from td.company ───────────────────

/**
 * On event pages (concalls, results) .symbol = NSE ticker like "SGFIN".
 * On entity pages (promoter, whales, rating) .symbol = sector like "FMCG" or "Miscellaneous".
 * Pass symbolIsTicker=true for pages where .symbol holds the actual ticker.
 */
function parseCompanyTd($, tdEl, symbolIsTicker = false) {
  const name       = $(tdEl).find('.name').text().trim()
                  || $(tdEl).text().split('\n').map(s => s.trim()).filter(Boolean)[0]
                  || '';
  const symbolText = $(tdEl).find('.symbol').text().trim() || null;
  const ticker     = symbolIsTicker ? symbolText : null;
  const sector     = !symbolIsTicker ? symbolText : null;
  return { name, ticker, sector };
}

function cleanSummary(text) {
  if (!text) return null;
  // Strip premium-lock overlay content that leaks into scraped text
  const cleaned = text
    .replace(/\s*Unlock\s+Premium[\s\S]*/i, '')
    .replace(/\s*Unlock to gain access[\s\S]*/i, '')
    .trim();
  return cleaned || null;
}

function toIso(raw) {
  if (!raw) return null;
  const parsed = new Date(raw);
  return isNaN(parsed) ? raw : parsed.toISOString().split('T')[0];
}

// ─── Section page: Promoter Buying ───────────────────────────────────────────

async function fetchPromoterBuying() {
  try {
    const $ = await fetchPage(BASE_URL + 'promoter-buying/');
    const items = [];
    $('table tbody tr').each((_, row) => {
      const { name, sector } = parseCompanyTd($, $(row).find('td.company'), false);
      if (!name) return;
      const date      = $(row).find('td.date').text().trim() || null;
      const quantity  = $(row).find('td.quantity').text().trim() || null;
      const amount    = $(row).find('td.amount').text().trim() || null;
      const marketCap = $(row).find('td.mcap').text().trim() || null;
      items.push({ name, ticker: null, sector, date, quantity, amount, marketCap });
    });
    console.log(`  ✓ promoterBuying: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchPromoterBuying failed: ${err.message}`);
    return [];
  }
}

// ─── Section page: Whales Buying ─────────────────────────────────────────────

async function fetchWhalesBuying() {
  try {
    const $ = await fetchPage(BASE_URL + 'whales-buying/');
    const items = [];
    $('table tbody tr').each((_, row) => {
      const { name, sector } = parseCompanyTd($, $(row).find('td.company'), false);
      if (!name) return;
      const whaleName   = $(row).find('td.whale').text().trim() || null;
      const dealType    = $(row).find('td.deal_type').text().trim() || null;
      const currHolding = $(row).find('td.current_holding').text().trim() || null;
      const prevHolding = $(row).find('td.prev_holding').text().trim() || null;
      const marketCap   = $(row).find('td.mcap').text().trim() || null;
      items.push({ name, ticker: null, sector, whaleName, dealType, currHolding, prevHolding, marketCap });
    });
    console.log(`  ✓ whalesBuying: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchWhalesBuying failed: ${err.message}`);
    return [];
  }
}

// ─── Section page: Rating Upgrades ───────────────────────────────────────────

async function fetchRatingUpgrades() {
  try {
    const $ = await fetchPage(BASE_URL + 'rating-upgrades/');
    const items = [];
    $('table tbody tr').each((_, row) => {
      const { name, sector } = parseCompanyTd($, $(row).find('td.company'), false);
      if (!name) return;
      const agency    = $(row).find('td.rating_agency').text().trim() || null;
      const rating    = $(row).find('td.latest_ranking').text().trim() || null;
      const marketCap = $(row).find('td.mcap').text().trim() || null;
      items.push({ name, ticker: null, sector, agency, rating, marketCap });
    });
    console.log(`  ✓ ratingUpgrades: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchRatingUpgrades failed: ${err.message}`);
    return [];
  }
}

// ─── Section page: Concalls ──────────────────────────────────────────────────

async function fetchConcalls() {
  try {
    const $ = await fetchPage(BASE_URL + 'concalls/');
    const items = [];
    $('table tbody tr').each((_, row) => {
      const { name, ticker } = parseCompanyTd($, $(row).find('td.company'), true);
      if (!name) return;
      // Both date and time share class "date"; first = date, second = time
      const dateTds = $(row).find('td.date');
      const dateRaw = dateTds.eq(0).text().trim() || null;
      const time    = dateTds.eq(1).text().trim() || null;
      const marketCap = $(row).find('td.mcap').text().trim() || null;
      items.push({ name, ticker, date: toIso(dateRaw), time, marketCap });
    });
    console.log(`  ✓ concalls: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchConcalls failed: ${err.message}`);
    return [];
  }
}

// ─── Section page: Upcoming Results ──────────────────────────────────────────

async function fetchUpcomingResults() {
  try {
    const $ = await fetchPage(BASE_URL + 'upcoming-results/');
    const items = [];
    $('table tbody tr').each((_, row) => {
      const { name, ticker } = parseCompanyTd($, $(row).find('td.company'), true);
      if (!name) return;
      const dateRaw   = $(row).find('td.date').text().trim() || null;
      const marketCap = $(row).find('td.mcap').text().trim() || null;
      items.push({ name, ticker, date: toIso(dateRaw), marketCap });
    });
    console.log(`  ✓ upcomingResults: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchUpcomingResults failed: ${err.message}`);
    return [];
  }
}

// ─── Section page: Capex / Fund Raise (card_tj style) ────────────────────────

async function fetchFilingCards(slug) {
  try {
    const $ = await fetchPage(BASE_URL + slug + '/');
    const items = [];
    $('.card_tj').each((_, card) => {
      const name = $(card).find('.name__container a span').first().text().trim()
                || $(card).find('.name__container').text().trim();
      if (!name) return;
      const ticker    = $(card).find('.symbol, .ticker').text().trim() || null;
      const marketCap = $(card).find('.mcap_classification span').text().trim() || null;
      const timeAgo   = $(card).find('.company .date').text().trim() || null;
      const filingTitle = $(card).find('.link a span').first().text().trim() || null;
      const bseLink   = $(card).find('.link a[href]').attr('href') || null;
      // AI summary — remove badge label, then strip premium-lock text
      const summaryEl = $(card).find('.event_ai_summary').clone();
      summaryEl.find('.ai_badge, .lock_overlay, .premium_lock').remove();
      const summary = cleanSummary(summaryEl.text().trim());
      items.push({ name, ticker, marketCap, timeAgo, filingTitle, bseLink, summary });
    });
    console.log(`  ✓ ${slug}: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchFilingCards(${slug}) failed: ${err.message}`);
    return [];
  }
}

// ─── Section page: Trending on Social Media ──────────────────────────────────

async function fetchTrendingSocial() {
  try {
    const $ = await fetchPage(BASE_URL + 'trending-on-social-media/');
    const items = [];
    $('.card_tj').each((_, card) => {
      const name      = $(card).find('.name__container a').text().trim();
      if (!name) return;
      const ticker    = $(card).find('.symbol, .ticker').text().trim() || null;
      const marketCap = $(card).find('.mcap_classification span').text().trim() || null;

      // Full tweet data lives in <script type="application/json">
      let tweetText = null, tweetId = null, tweetUrl = null;
      let authorName = null, authorHandle = null, authorImageUrl = null;
      let likes = null, retweets = null, mediaImageUrl = null;

      $(card).find('script[type="application/json"]').each((_, script) => {
        try {
          const json = JSON.parse($(script).text());
          const d = json?.data;
          if (!d?.text) return;

          tweetText = d.text;
          tweetId   = d.id || null;

          // Author info from includes.users
          const author = (json?.includes?.users || []).find(u => u.id === d.author_id);
          if (author) {
            authorName     = author.name || null;
            authorHandle   = author.username || author.screen_name || null;
            authorImageUrl = author.profile_image_url_https || author.profile_image_url || null;
          }

          if (authorHandle && tweetId) {
            tweetUrl = `https://x.com/${authorHandle}/status/${tweetId}`;
          }

          // Engagement counts
          likes    = d.public_metrics?.like_count    ?? null;
          retweets = d.public_metrics?.retweet_count ?? null;

          // First attached image
          const media = d.attachments?.media || json?.includes?.media || [];
          if (media.length > 0) {
            mediaImageUrl = media[0].media_url_https || media[0].url || null;
          }
        } catch (_) {}
      });

      items.push({ name, ticker, marketCap, tweetText, tweetId, tweetUrl,
                   authorName, authorHandle, authorImageUrl,
                   likes, retweets, mediaImageUrl });
    });
    console.log(`  ✓ trendingSocial: ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchTrendingSocial failed: ${err.message}`);
    return [];
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

async function fetchIdeasDashboard() {
  console.log('📋 Fetching Tijori Ideas Dashboard...');

  // Main dashboard for simple card sections + gainers/losers/trending
  const $ = await fetchPage(BASE_URL);
  const heading = $('h2').first().text().trim();
  if (!heading.includes('Ideas')) {
    console.warn('  ⚠️  Unexpected main page content');
  }

  // Fetch all detail section pages in parallel
  const [
    promoterBuying,
    whalesBuying,
    ratingUpgrades,
    concalls,
    upcomingResults,
    capexDetail,
    fundRaise,
    trendingSocial,
  ] = await Promise.all([
    fetchPromoterBuying(),
    fetchWhalesBuying(),
    fetchRatingUpgrades(),
    fetchConcalls(),
    fetchUpcomingResults(),
    fetchFilingCards('capex-announcement'),
    fetchFilingCards('fund-raise'),
    fetchTrendingSocial(),
  ]);

  // Capex: use detail page data if available, fall back to main dashboard summary cards
  const capexDashboard = extractCards($, 'capex-announcement');
  const capex = capexDetail.length > 0 ? capexDetail : capexDashboard;
  if (capexDetail.length === 0 && capexDashboard.length > 0) {
    console.log(`  ⚠️  capex detail page rate-limited, using ${capexDashboard.length} dashboard cards`);
  }

  return {
    promoterBuying,
    whalesBuying,
    ratingUpgrades,
    merger:      extractCards($, 'merger'),
    demerger:    extractCards($, 'demerger'),
    buybacks:    extractCards($, 'buyback'),
    fundRaise,
    capex,
    upcomingResults,
    concalls,
    trendingSocial,
    topGainers:  extractGainersLosers($, 'top-gainers'),
    topLosers:   extractGainersLosers($, 'top-losers'),
  };
}

module.exports = { fetchIdeasDashboard };
