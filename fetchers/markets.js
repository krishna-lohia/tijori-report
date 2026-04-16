/**
 * NSE Markets — fetches index data via Kite Connect.
 * Quotes: current price + day change.
 * Historical: 400 days of daily candles → 1W, 1M, 3M, 1Y returns.
 */

const { getKite } = require('./kite-client');

// Instrument tokens are stable NSE index tokens from Kite
const TARGET_INDICES = [
  { token: 256265, symbol: 'NSE:NIFTY 50',          display: 'Nifty 50' },
  { token: 270857, symbol: 'NSE:NIFTY NEXT 50',      display: 'Nifty Next 50' },
  { token: 266249, symbol: 'NSE:NIFTY MIDCAP 150',   display: 'Nifty Midcap 150' },
  { token: 267273, symbol: 'NSE:NIFTY SMLCAP 250',   display: 'Nifty Smallcap 250' },
  { token: 264969, symbol: 'NSE:INDIA VIX',           display: 'India VIX' },
];

function pctReturn(curr, base) {
  if (base == null || base === 0) return null;
  return parseFloat(((curr - base) / base * 100).toFixed(2));
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

async function fetchMarketsData() {
  console.log('📊 Fetching market data from Kite...');

  const kite = await getKite();

  // ── 1. Current quotes ──────────────────────────────────────────────────────
  const symbols = TARGET_INDICES.map(i => i.symbol);
  const quotes  = await kite.getQuote(symbols);

  // ── 2. Historical data (last 400 trading days) for period returns ──────────
  const today = new Date();
  const from  = new Date(today.getTime() - 400 * 24 * 60 * 60 * 1000);

  const headline = await Promise.all(TARGET_INDICES.map(async (idx) => {
    const q = quotes[idx.symbol];

    let ltp = null, change_pct = null;
    if (q) {
      ltp        = q.last_price;
      const prev = q.ohlc?.close;
      change_pct = prev ? parseFloat(((ltp - prev) / prev * 100).toFixed(2)) : null;
    }

    let ret_1w = null, ret_1m = null, ret_3m = null, ret_1y = null;
    try {
      const hist   = await kite.getHistoricalData(idx.token, 'day', dateStr(from), dateStr(today));
      const closes = hist.map(c => c.close).filter(v => v != null);
      const n      = closes.length;
      if (n > 0) {
        const curr = closes[n - 1];
        if (n >= 6)   ret_1w = pctReturn(curr, closes[n - 6]);   // ~5 trading days
        if (n >= 23)  ret_1m = pctReturn(curr, closes[n - 23]);  // ~22 trading days
        if (n >= 66)  ret_3m = pctReturn(curr, closes[n - 66]);  // ~65 trading days
        if (n >= 253) ret_1y = pctReturn(curr, closes[n - 253]); // ~252 trading days
      }
    } catch (err) {
      console.warn(`  ⚠️  Historical data failed for ${idx.display}: ${err.message}`);
    }

    return { display: idx.display, ltp, change_pct, ret_1w, ret_1m, ret_3m, ret_1y };
  }));

  // ── Log summary ────────────────────────────────────────────────────────────
  const fmt = v => v != null ? (v >= 0 ? '+' : '') + v + '%' : '—';
  headline.forEach(h => {
    console.log(`  ${h.display}: day ${fmt(h.change_pct)} | 1W ${fmt(h.ret_1w)} | 1M ${fmt(h.ret_1m)} | 3M ${fmt(h.ret_3m)} | 1Y ${fmt(h.ret_1y)}`);
  });

  const fetched = headline.filter(h => h.change_pct !== null).length;
  console.log(`✅ Markets: ${fetched}/${headline.length} indices fetched`);

  return { headline };
}

module.exports = { fetchMarketsData };
