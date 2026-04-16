/**
 * Tijori Daily Investor Report — HTML Renderer
 * Design: matches https://krishna-lohia.github.io/aftermarket-report/
 */

const TIJORI_LOGO_B64 = 'data:image/png;base64,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';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctFmt(v, dec = 2) {
  if (v == null || isNaN(v)) return '—';
  return (v >= 0 ? '+' : '') + Number(v).toFixed(dec) + '%';
}
function pctColor(v) {
  if (v == null || isNaN(v)) return '#888';
  return v >= 0 ? '#2e9c5e' : '#d94f4f';
}

function mcapBadge(mc) {
  if (!mc) return '';
  const colors = {
    'large cap': { bg: '#e6f4ec', color: '#1a7a3c' },
    'mid cap':   { bg: '#e6eef9', color: '#1a4fa0' },
    'small cap': { bg: '#f0ebfa', color: '#5c2d9e' },
    'micro cap': { bg: '#fdf3e0', color: '#a06c00' },
    'nano cap':  { bg: '#f0f0f0', color: '#666666' },
  };
  const c = colors[mc.toLowerCase()] || colors['nano cap'];
  return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${c.bg};color:${c.color};white-space:nowrap;">${mc}</span>`;
}

// ─── Table helpers ────────────────────────────────────────────────────────────

const TH = `padding:10px 12px;font-size:12px;font-weight:600;color:#666666;letter-spacing:0;text-transform:none;border-bottom:1px solid #f0f0f0;background:#fafafa;text-align:left;`;
const TD = `padding:12px;font-size:14px;color:#333333;border-bottom:1px solid #f0f0f0;vertical-align:middle;`;
const TD_MONO = `${TD}font-family:'SF Mono',Consolas,monospace;font-size:12px;color:#888;`;

function emptyState(msg) {
  return `<p style="font-size:14px;color:#aaa;font-style:italic;padding:12px 0;">${msg}</p>`;
}

function companyRows(items, max = 10) {
  if (!items || items.length === 0) return null;
  return items.slice(0, max).map(c => `
    <tr>
      <td style="${TD}font-weight:500;">${c.name || '—'}</td>
      <td style="${TD_MONO}">${c.ticker || '—'}</td>
      <td style="${TD}">${mcapBadge(c.marketCap)}</td>
      <td style="${TD}color:#888;font-size:13px;">${c.sector || '—'}</td>
    </tr>`).join('');
}

function companyTable(items, emptyMsg = 'None today') {
  const rows = companyRows(items);
  if (!rows) return emptyState(emptyMsg);
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Company</th>
        <th style="${TH}">Ticker</th>
        <th style="${TH}">Market Cap</th>
        <th style="${TH}">Sector</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── Rich section tables ───────────────────────────────────────────────────────

function promoterTable(items, max = 15) {
  if (!items || items.length === 0) return emptyState('No promoter buying today');
  const rows = items.slice(0, max).map(c => `
    <tr>
      <td style="${TD}">
        <div style="font-weight:500;color:#222;">${c.name || '—'}</div>
        ${c.sector ? `<div style="font-size:12px;color:#aaa;margin-top:2px;">${c.sector}</div>` : ''}
      </td>
      <td style="${TD}font-size:13px;color:#555;">${c.date || '—'}</td>
      <td style="${TD}font-size:13px;color:#555;text-align:right;">${c.quantity || '—'}</td>
      <td style="${TD}font-size:13px;color:#1a7a3c;font-weight:600;text-align:right;">${c.amount || '—'}</td>
      <td style="${TD}">${mcapBadge(c.marketCap)}</td>
    </tr>`).join('');
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Company</th>
        <th style="${TH}">Date</th>
        <th style="${TH}text-align:right;">Qty</th>
        <th style="${TH}text-align:right;">Amount</th>
        <th style="${TH}">Market Cap</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function whalesTable(items, max = 15) {
  if (!items || items.length === 0) return emptyState('No whale activity today');
  const rows = items.slice(0, max).map(c => {
    const curr = c.currHolding && c.currHolding !== '-' ? c.currHolding : '—';
    const prev = c.prevHolding && c.prevHolding !== '-' ? c.prevHolding : null;
    const holdingChange = (prev && prev !== curr)
      ? `<span style="font-size:11px;color:#aaa;margin-left:4px;">(was ${prev})</span>`
      : '';
    return `
    <tr>
      <td style="${TD}">
        <div style="font-weight:500;color:#222;">${c.name || '—'}</div>
        ${c.sector ? `<div style="font-size:12px;color:#aaa;margin-top:2px;">${c.sector}</div>` : ''}
      </td>
      <td style="${TD}font-weight:500;color:#1a4fa0;font-size:13px;">${c.whaleName || '—'}</td>
      <td style="${TD}font-size:12px;color:#888;">${c.dealType && c.dealType !== '-' ? c.dealType : '—'}</td>
      <td style="${TD}font-size:13px;font-weight:600;text-align:right;">${curr}${holdingChange}</td>
      <td style="${TD}">${mcapBadge(c.marketCap)}</td>
    </tr>`;
  }).join('');
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Company</th>
        <th style="${TH}">Investor</th>
        <th style="${TH}">Deal</th>
        <th style="${TH}text-align:right;">Holding %</th>
        <th style="${TH}">Market Cap</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function ratingTable(items, max = 15) {
  if (!items || items.length === 0) return emptyState('No rating upgrades today');
  const rows = items.slice(0, max).map(c => `
    <tr>
      <td style="${TD}">
        <div style="font-weight:500;color:#222;">${c.name || '—'}</div>
        ${c.sector ? `<div style="font-size:12px;color:#aaa;margin-top:2px;">${c.sector}</div>` : ''}
      </td>
      <td style="${TD}font-size:13px;color:#888;">${c.agency || '—'}</td>
      <td style="${TD}">
        <span style="font-size:13px;font-weight:700;color:#1a7a3c;background:#e6f4ec;padding:2px 8px;border-radius:4px;">${c.rating || '—'}</span>
      </td>
      <td style="${TD}">${mcapBadge(c.marketCap)}</td>
    </tr>`).join('');
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Company</th>
        <th style="${TH}">Agency</th>
        <th style="${TH}">Rating</th>
        <th style="${TH}">Market Cap</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Fund raise: clean one-liner per company, no raw BSE filing title
function fundRaiseList(items, max = 10) {
  if (!items || items.length === 0) return emptyState('No fund raises today');
  const rows = items.slice(0, max).map(c => `
    <tr>
      <td style="${TD}">
        <div style="font-weight:500;color:#222;">${c.name || '—'}</div>
        ${c.sector ? `<div style="font-size:12px;color:#aaa;margin-top:2px;">${c.sector}</div>` : ''}
      </td>
      <td style="${TD}">${mcapBadge(c.marketCap)}</td>
      <td style="${TD}font-size:12px;color:#aaa;">${c.timeAgo || '—'}</td>
      <td style="${TD}text-align:right;">
        ${c.bseLink ? `<a href="${c.bseLink}" target="_blank" rel="noopener" style="font-size:12px;color:#387ED1;text-decoration:none;font-weight:600;">Filing →</a>` : ''}
      </td>
    </tr>`).join('');
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Company</th>
        <th style="${TH}">Market Cap</th>
        <th style="${TH}">Filed</th>
        <th style="${TH}text-align:right;">Link</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Capex: show company + brief description if available, BSE link
function capexList(items, max = 10) {
  if (!items || items.length === 0) return emptyState('No capex announcements today');

  // Detect if items are rich (have filingTitle/bseLink) or simple dashboard cards
  const isRich = items.some(c => c.bseLink || c.filingTitle);

  if (!isRich) {
    // Simple dashboard fallback: just company + sector + mcap
    const rows = items.slice(0, max).map(c => `
      <tr>
        <td style="${TD}">
          <div style="font-weight:500;color:#222;">${c.name || '—'}</div>
          ${c.sector ? `<div style="font-size:12px;color:#aaa;margin-top:2px;">${c.sector}</div>` : ''}
        </td>
        <td style="${TD}">${mcapBadge(c.marketCap)}</td>
        <td style="${TD}font-size:12px;color:#aaa;">${c.detail || ''}</td>
      </tr>`).join('');
    return `
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="${TH}">Company</th>
          <th style="${TH}">Market Cap</th>
          <th style="${TH}">Detail</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // Rich cards: company + full filing title + BSE link (no AI summary — it's paywalled)
  return items.slice(0, max).map(c => {
    const bseBtn = c.bseLink
      ? `<a href="${c.bseLink}" target="_blank" rel="noopener" style="font-size:12px;color:#387ED1;text-decoration:none;font-weight:600;white-space:nowrap;flex-shrink:0;">Filing →</a>`
      : '';
    // Full filing title, strip line breaks and leading boilerplate
    const rawTitle = c.filingTitle ? c.filingTitle.replace(/\s+/g, ' ').trim() : null;
    return `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid #f5f5f5;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-weight:600;color:#222;font-size:14px;">${c.name}</span>
            ${mcapBadge(c.marketCap)}
          </div>
          ${rawTitle ? `<div style="font-size:13px;color:#555;margin-top:6px;line-height:1.5;">${rawTitle}</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;white-space:nowrap;margin-left:8px;">
          ${c.timeAgo ? `<span style="font-size:11px;color:#bbb;">${c.timeAgo}</span>` : ''}
          ${bseBtn}
        </div>
      </div>`;
  }).join('');
}

function tweetAge(tweetId) {
  if (!tweetId) return null;
  try {
    const TWITTER_EPOCH = 1288834974657n;
    const ms = Number((BigInt(tweetId) >> 22n) + TWITTER_EPOCH);
    const diffMs = Date.now() - ms;
    const diffH  = Math.floor(diffMs / 3_600_000);
    const diffD  = Math.floor(diffH / 24);
    if (diffH < 1)  return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD === 1) return 'yesterday';
    return `${diffD}d ago`;
  } catch (_) { return null; }
}

// Social: full tweet card — author, text, image, metrics, link to X
function socialList(items, max = 6) {
  if (!items || items.length === 0) return emptyState('No trending names on social media today');
  return items.slice(0, max).map((c, idx) => {
    // Keep tweet text as-is, strip only t.co media placeholder links (pic.x.com ones)
    const tweetBody = c.tweetText
      ? c.tweetText.replace(/https?:\/\/t\.co\/\S+/g, '').trim()
      : null;

    const age = tweetAge(c.tweetId);
    const authorBlock = (c.authorName || c.authorHandle)
      ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          ${c.authorImageUrl
            ? `<img src="${c.authorImageUrl}" alt="" style="width:36px;height:36px;border-radius:50%;flex-shrink:0;">`
            : `<div style="width:36px;height:36px;border-radius:50%;background:#e0e0e0;flex-shrink:0;"></div>`}
          <div>
            <div style="font-weight:700;font-size:14px;color:#14171A;">${c.authorName || ''}</div>
            ${c.authorHandle ? `<div style="font-size:12px;color:#657786;">@${c.authorHandle}${age ? ` · ${age}` : ''}</div>` : ''}
          </div>
          <div style="margin-left:auto;display:flex;align-items:center;gap:4px;">
            <span style="font-size:13px;color:#1DA1F2;font-weight:700;">&#120143;</span>
          </div>
        </div>`
      : '';

    const mediaBlock = c.mediaImageUrl
      ? `<div style="margin:10px 0;border-radius:8px;overflow:hidden;max-height:220px;">
           <img src="${c.mediaImageUrl}" alt="" style="width:100%;max-height:220px;object-fit:cover;display:block;">
         </div>`
      : '';

    const metricsBlock = (c.likes != null || c.retweets != null)
      ? `<div style="display:flex;gap:16px;margin-top:10px;font-size:13px;color:#657786;">
          ${c.retweets != null ? `<span>&#8635; ${c.retweets}</span>` : ''}
          ${c.likes != null    ? `<span>&#10084; ${c.likes}</span>` : ''}
        </div>`
      : '';

    const footer = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:13px;font-weight:600;color:#222;">${c.name}</span>
          ${mcapBadge(c.marketCap)}
        </div>
        ${c.tweetUrl ? `<a href="${c.tweetUrl}" target="_blank" rel="noopener" style="font-size:12px;color:#1DA1F2;text-decoration:none;font-weight:600;">View on X →</a>` : ''}
      </div>`;

    return `
      <div style="border:1px solid #e1e8ed;border-radius:12px;padding:16px;${idx > 0 ? 'margin-top:16px;' : ''}">
        ${authorBlock}
        ${tweetBody ? `<p style="font-size:15px;color:#14171A;line-height:1.65;margin:0;white-space:pre-wrap;">${tweetBody}</p>` : ''}
        ${mediaBlock}
        ${metricsBlock}
        ${footer}
      </div>`;
  }).join('');
}

function gainersLosersTable(gainers, losers) {
  const max = Math.min(Math.max(gainers?.length || 0, losers?.length || 0), 5);
  if (max === 0) return emptyState('No data available');
  const rows = Array.from({ length: max }, (_, i) => {
    const g = gainers?.[i];
    const l = losers?.[i];
    return `<tr>
      <td style="${TD}font-weight:500;">${g?.name || '—'}</td>
      <td style="${TD}text-align:right;color:${pctColor(g?.pct)};font-weight:600;">${pctFmt(g?.pct)}</td>
      <td style="${TD}padding-left:24px;font-weight:500;">${l?.name || '—'}</td>
      <td style="${TD}text-align:right;color:${pctColor(l?.pct)};font-weight:600;">${pctFmt(l?.pct)}</td>
    </tr>`;
  }).join('');
  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Top Gainers</th>
        <th style="${TH}text-align:right;">Change</th>
        <th style="${TH}padding-left:24px;">Top Losers</th>
        <th style="${TH}text-align:right;">Change</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function indexTable(headline) {
  if (!headline || headline.every(h => h.change_pct === null)) {
    return emptyState('Market data unavailable');
  }
  const hasHistory = headline.some(h => h.ret_1w != null);
  if (!hasHistory) {
    // Fallback: single column
    return `
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="${TH}">Index</th>
          <th style="${TH}text-align:right;">Day</th>
        </tr></thead>
        <tbody>${headline.map(h => `
          <tr>
            <td style="${TD}font-weight:500;">${h.display}</td>
            <td style="${TD}text-align:right;font-size:15px;font-weight:700;color:${pctColor(h.change_pct)};">${pctFmt(h.change_pct)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  const cell = (v) => {
    if (v == null || isNaN(v)) return `<td style="${TD}text-align:right;color:#ccc;font-size:13px;">—</td>`;
    return `<td style="${TD}text-align:right;font-size:13px;font-weight:600;color:${pctColor(v)};">${pctFmt(v, 1)}</td>`;
  };

  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Index</th>
        <th style="${TH}text-align:right;">Day</th>
        <th style="${TH}text-align:right;">1W</th>
        <th style="${TH}text-align:right;">1M</th>
        <th style="${TH}text-align:right;">3M</th>
        <th style="${TH}text-align:right;">1Y</th>
      </tr></thead>
      <tbody>${headline.map(h => `
        <tr>
          <td style="${TD}font-weight:500;">${h.display}</td>
          <td style="${TD}text-align:right;font-size:15px;font-weight:700;color:${pctColor(h.change_pct)};">${pctFmt(h.change_pct, 2)}</td>
          ${cell(h.ret_1w)}
          ${cell(h.ret_1m)}
          ${cell(h.ret_3m)}
          ${cell(h.ret_1y)}
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ─── Section blocks ───────────────────────────────────────────────────────────

function divider() {
  return `<div style="height:1px;background:#eeeeee;margin:40px 0;"></div>`;
}

function sectionTitle(label) {
  return `<div style="font-size:11px;font-weight:700;color:#9B9B9B;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:16px;">${label}</div>`;
}

function subsectionLabel(label, desc = '') {
  return `
    <div style="margin:28px 0 10px;">
      <div style="font-size:11px;font-weight:700;color:#AAAAAA;letter-spacing:1px;text-transform:uppercase;">${label}</div>
      ${desc ? `<div style="font-size:13px;color:#bbbbbb;margin-top:3px;">${desc}</div>` : ''}
    </div>`;
}

function bodyPara(text) {
  if (!text) return '';
  return `<p style="font-size:16px;line-height:1.8;color:#333333;margin-bottom:16px;">${text}</p>`;
}

function sourceNote(text = 'Source: NSE India') {
  return `<p style="font-size:11px;color:#CCCCCC;margin-top:12px;">${text}</p>`;
}

// ─── Tijori source attribution (matches AMR pattern) ─────────────────────────

function tijoriSource() {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
      <span style="font-size:12px;color:#999999;">Source: Tijori Finance <span style="color:#CCCCCC;font-weight:400;">· tijorifinance.com</span></span>
      <img src="${TIJORI_LOGO_B64}" alt="Tijori" style="height:28px;display:block;">
    </div>`;
}

// ─── Native data card ─────────────────────────────────────────────────────────

function dataCard(items, emptyMsg = 'None today') {
  const inner = (!items || items.length === 0)
    ? `<div style="padding:16px 0;">${emptyState(emptyMsg)}</div>`
    : `<div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">${companyTable(items)}</div>`;
  return `
    <div style="margin-top:16px;">
      ${inner}
      ${tijoriSource()}
    </div>`;
}

function gainersCard(gainers, losers) {
  return `
    <div style="margin-top:16px;">
      <div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">${gainersLosersTable(gainers, losers)}</div>
      ${tijoriSource()}
    </div>`;
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function dayLabel(dateStr, today) {
  const tomorrow = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];
  if (dateStr === today)    return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
}

function dayFull(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Single-type date-grouped list (results or concalls)
function dateGroupedList(items, reportDate, showTime = false) {
  const entries = (items || []).filter(e => e.date);
  if (entries.length === 0) return emptyState('Nothing scheduled');

  const today = reportDate || new Date().toISOString().split('T')[0];
  const byDate = {};
  entries.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  const blocks = Object.keys(byDate).sort().map(dateStr => {
    const label   = dayLabel(dateStr, today);
    const full    = dayFull(dateStr);
    const isToday = dateStr === today;

    const rows = byDate[dateStr].map(e => {
      const timeHtml = (showTime && e.time)
        ? `<span style="font-size:12px;color:#aaa;margin-left:6px;">${e.time}</span>`
        : '';
      const tickerHtml = e.ticker
        ? `<span style="font-size:12px;color:#aaa;font-family:'SF Mono',Consolas,monospace;margin-left:8px;">${e.ticker}</span>`
        : '';
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;">
          <div>
            <span style="font-size:14px;font-weight:500;color:#222;">${e.name}</span>
            ${tickerHtml}
            ${timeHtml}
          </div>
          ${mcapBadge(e.marketCap)}
        </div>`;
    }).join('');

    return `
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;">
          <span style="font-size:12px;font-weight:700;color:${isToday ? '#1a4fa0' : '#999'};letter-spacing:0.05em;text-transform:uppercase;">${label}</span>
          <span style="font-size:12px;color:#bbb;">${full}</span>
        </div>
        <div style="border:1px solid #f0f0f0;border-radius:8px;padding:0 14px;">
          ${rows}
        </div>
      </div>`;
  }).join('');

  return `<div style="margin-top:16px;">${blocks}${tijoriSource()}</div>`;
}

// ─── Main renderer ────────────────────────────────────────────────────────────

function renderReport(data) {
  const { dateFormatted, markets, ideas, narrative = {}, screenshots = {} } = data;
  const s = screenshots;
  const i = ideas || {};
  const mergerDemerger = [...(i.merger || []), ...(i.demerger || [])];

  // ── Section 1: Market Snapshot ──────────────────────────────────────────────
  const s1 = `
    ${sectionTitle('Market Snapshot')}
    ${bodyPara(narrative.marketSnapshot)}
    ${indexTable(markets?.headline)}
    ${sourceNote('Source: NSE India')}
  `;

  // ── Section 2: Smart Money Signals ─────────────────────────────────────────
  const s2 = `
    ${sectionTitle('Smart Money Signals')}
    ${subsectionLabel('Promoter Buying', 'Promoters buying their own stock')}
    ${bodyPara(narrative.promoterComment)}
    <div style="margin-top:12px;">
      <div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">${promoterTable(i.promoterBuying)}</div>
      ${tijoriSource()}
    </div>
    ${subsectionLabel('Whales Buying', 'Large institutional investors increasing stake')}
    ${bodyPara(narrative.whalesComment)}
    <div style="margin-top:12px;">
      <div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">${whalesTable(i.whalesBuying)}</div>
      ${tijoriSource()}
    </div>
    ${subsectionLabel('Rating Upgrades')}
    ${bodyPara(narrative.ratingComment)}
    <div style="margin-top:12px;">
      <div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">${ratingTable(i.ratingUpgrades)}</div>
      ${tijoriSource()}
    </div>
  `;

  // ── Section 3: Corporate Moves ─────────────────────────────────────────────
  const s3 = `
    ${sectionTitle('Corporate Moves')}
    ${bodyPara(narrative.corporateMoves)}
    ${subsectionLabel('Mergers', 'Structural changes that reshape the investment thesis')}
    ${dataCard(i.merger)}
    ${subsectionLabel('Demergers')}
    ${dataCard(i.demerger)}
    ${subsectionLabel('Buybacks', 'Companies returning capital to shareholders')}
    ${dataCard(i.buybacks)}
    ${subsectionLabel('Fund Raises / QIPs', 'Capital raises')}
    ${bodyPara(narrative.fundRaiseComment)}
    <div style="margin-top:12px;">
      <div style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">${fundRaiseList(i.fundRaise)}</div>
      ${tijoriSource()}
    </div>
  `;

  // ── Section 4: Capex Watch ──────────────────────────────────────────────────
  const s4 = `
    ${sectionTitle('Capex Watch')}
    ${bodyPara(narrative.capexWatch)}
    <div style="margin-top:16px;">
      ${capexList(i.capex)}
      ${tijoriSource()}
    </div>
  `;

  // ── Section 5: Calendar ────────────────────────────────────────────────────
  const concallBanner = `
    <p style="font-size:14px;color:#888;margin-top:16px;">
      Follow live transcripts as concalls happen on <a href="https://www.tijoristack.ai/concall-monitor/app/" target="_blank" rel="noopener" style="color:#387ED1;text-decoration:none;">Tijori Concall Monitor</a>.
    </p>`;

  const s5 = `
    ${sectionTitle('Calendar')}
    ${subsectionLabel('Upcoming Results', 'Companies reporting quarterly earnings')}
    ${bodyPara(narrative.resultsComment)}
    ${dateGroupedList(i.upcomingResults, data.date, false)}
    ${subsectionLabel('Upcoming Concalls', 'Earnings calls to listen to')}
    ${bodyPara(narrative.concallsComment)}
    ${dateGroupedList(i.concalls, data.date, true)}
    ${concallBanner}
  `;

  // ── Section 6: Trending on Social Media ────────────────────────────────────
  const s6 = `
    ${sectionTitle('Trending on Social Media')}
    <div style="margin-top:16px;">
      ${socialList(i.trendingSocial)}
      ${tijoriSource()}
    </div>
  `;

  // ── Section 7: Trending & Momentum ─────────────────────────────────────────
  const s7 = `
    ${sectionTitle('Trending & Momentum')}
    ${bodyPara(narrative.trending)}
    ${gainersCard(i.topGainers, i.topLosers)}
  `;

  // ── Full page ───────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tijori Daily Investor Report — ${dateFormatted}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }
    .nl-wrap { max-width: 728px; margin: 0 auto; padding: 48px 24px 80px; }

    .nl-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e7e7e7;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .nl-brand { display: flex; flex-direction: column; gap: 4px; }
    .nl-brand-name { font-size: 11px; font-weight: 700; color: #9B9B9B; letter-spacing: 1.5px; text-transform: uppercase; }
    .nl-brand-sub { font-size: 11px; font-weight: 600; color: #BBBBBB; letter-spacing: 1px; text-transform: uppercase; }
    .nl-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .nl-date { font-size: 13px; font-weight: 500; color: #BBBBBB; }
    .copy-btn {
      background: #387ED1; color: #ffffff; border: none;
      padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700;
      letter-spacing: 0.4px; text-transform: uppercase; cursor: pointer;
      transition: background 0.15s;
    }
    .copy-btn:hover { background: #2d6db8; }
    .copy-btn.copied { background: #4CAF52; }

    .nl-headline {
      font-size: 30px; font-weight: 700; line-height: 1.3;
      letter-spacing: -0.4px; color: #111111; margin-bottom: 40px;
    }

    .nl-section-nav { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 40px; }
    .nl-section-nav a {
      font-size: 11px; color: #999; text-decoration: none;
      padding: 4px 10px; border: 1px solid #e7e7e7; border-radius: 20px;
      transition: color 0.1s, border-color 0.1s;
    }
    .nl-section-nav a:hover { color: #387ED1; border-color: #387ED1; }

    .nl-footer {
      border-top: 1px solid #e7e7e7;
      margin-top: 56px;
      padding-top: 24px;
    }
    .nl-footer-brand { font-size: 13px; color: #AAAAAA; line-height: 1.5; }
    .nl-disclaimer { font-size: 11px; color: #CCCCCC; margin-top: 16px; line-height: 1.5; }

    @media (max-width: 600px) {
      .nl-wrap { padding: 24px 16px 48px; }
      .nl-headline { font-size: 22px; }
      .nl-header { flex-direction: column; align-items: flex-start; gap: 10px; }
      .nl-section-nav { display: none; }
    }
  </style>
</head>
<body>
<div class="nl-wrap">

  <header class="nl-header">
    <div class="nl-brand">
      <img src="${TIJORI_LOGO_B64}" alt="Tijori Finance" style="height:22px;width:auto;display:block;margin-bottom:4px;object-fit:contain;">
      <span class="nl-brand-sub">Daily Investor Report</span>
    </div>
    <div class="nl-header-right">
      <span class="nl-date">${dateFormatted}</span>
      <button class="copy-btn" onclick="copyReport()">Copy for Substack</button>
    </div>
  </header>

  <h1 class="nl-headline">${narrative.headline || 'Here is what mattered today for long-term investors.'}</h1>

  ${narrative.intro ? `<p style="font-style:italic;color:#666666;font-size:15px;line-height:1.7;margin:0 0 32px;max-width:640px;">${narrative.intro}</p>` : ''}

  <nav class="nl-section-nav">
    <a href="#s1">Market Snapshot</a>
    <a href="#s2">Smart Money</a>
    <a href="#s3">Corporate Moves</a>
    <a href="#s4">Capex Watch</a>
    <a href="#s5">Calendar</a>
    <a href="#s6">Social</a>
    <a href="#s7">Trending</a>
  </nav>

  <div id="s1">${s1}</div>
  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div id="s2">${s2}</div>
  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div id="s3">${s3}</div>
  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div id="s4">${s4}</div>
  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div id="s5">${s5}</div>
  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div id="s6">${s6}</div>
  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div id="s7">${s7}</div>

  <div style="height:1px;background:#eeeeee;margin:40px 0;"></div>
  <div style="background:#f7f7f5;border-radius:10px;padding:28px 32px;margin-bottom:40px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#999999;text-transform:uppercase;margin-bottom:14px;">About Tijori Finance</div>
    <p style="font-size:15px;line-height:1.75;color:#333333;margin:0 0 16px;">${narrative.tijoriPitch || ''}</p>
    <a href="https://tijorifinance.com" style="display:inline-block;background:#1a1a1a;color:#ffffff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:6px;text-decoration:none;letter-spacing:0.02em;">Explore Tijori Finance →</a>
  </div>

  <footer class="nl-footer">
    <div class="nl-footer-brand">Tijori Finance — Daily Investor Report</div>
    <div class="nl-disclaimer">
      This report is for informational purposes only and does not constitute investment advice.
      Data sourced from Tijori Finance, NSE, and BSE. Market cap classifications are indicative.
      Past performance is not indicative of future results.
    </div>
  </footer>

</div>

<div id="copy-toast" style="display:none;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;z-index:999;pointer-events:none;">
  Copied to clipboard
</div>

<script>
function copyReport() {
  var btn = document.querySelector('.copy-btn');
  var wrap = document.querySelector('.nl-wrap');
  var htmlBlob = new Blob([
    '<!DOCTYPE html><html><body style="font-family:-apple-system,Helvetica Neue,Arial,sans-serif;max-width:728px;margin:0 auto;padding:40px 24px;">' +
    wrap.innerHTML +
    '</body></html>'
  ], { type: 'text/html' });
  var textBlob = new Blob([wrap.innerText], { type: 'text/plain' });

  function showCopied() {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    var toast = document.getElementById('copy-toast');
    toast.style.display = 'block';
    setTimeout(function() {
      btn.textContent = 'Copy for Substack';
      btn.classList.remove('copied');
      toast.style.display = 'none';
    }, 2500);
  }

  if (navigator.clipboard && window.ClipboardItem) {
    navigator.clipboard.write([
      new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
    ]).then(showCopied).catch(function() { fallbackCopy(showCopied); });
  } else {
    fallbackCopy(showCopied);
  }
}

function fallbackCopy(cb) {
  var range = document.createRange();
  range.selectNode(document.querySelector('.nl-wrap'));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  try { document.execCommand('copy'); } catch(e) {}
  window.getSelection().removeAllRanges();
  if (cb) cb();
}
</script>

</body>
</html>`;
}

module.exports = { renderReport };
