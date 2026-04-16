/**
 * Tijori Daily Investor Report — Narrative Generator
 *
 * Uses Claude Haiku with rolling memory so writing improves
 * over time and carries context from previous days.
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs   = require('fs');
const path = require('path');

const client      = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MEMORY_PATH = path.join(__dirname, 'output', 'memory.json');

// ─── Memory ──────────────────────────────────────────────────────────────────

function loadMemory() {
  try {
    if (!fs.existsSync(MEMORY_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function saveMemory(date, note) {
  try {
    let memory = [];
    if (fs.existsSync(MEMORY_PATH)) {
      const raw = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
      if (Array.isArray(raw)) memory = raw;
    }
    memory = memory.filter(m => m.date !== date); // remove duplicate if re-running today
    memory.push({ date, note });
    if (memory.length > 90) memory = memory.slice(-90);
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
  } catch (err) {
    console.error('  ⚠️  Could not save memory:', err.message);
  }
}

function buildMemoryBlock(memory) {
  if (!memory || memory.length === 0) return '';
  const lines = ['RECENT HISTORY — use this to write with continuity. Call out repeat names, streaks, reversals.'];
  memory.forEach(m => lines.push(`[${m.date}] ${m.note}`));
  return lines.join('\n');
}

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You write the daily narrative for the Tijori Daily Investor Report. Readers are serious long-term investors in Indian equities who follow markets closely.

VOICE AND STYLE:
Write like a well-read investor writing a letter to fellow serious investors. Clear, direct, and complete. Opinionated where the data genuinely warrants it. Not verbose, but also not terse shorthand.

Every sentence must be a complete, readable thought. Do not write in Bloomberg chat shorthand ("All action sub-₹500Cr", "VIX compressed on low vol"). Write it out properly.

The reader knows what promoter buying, demergers, QIP, concalls, NBFC, capex, VIX etc. mean. Never explain these terms.

Vary sentence structure. Mix short sentences with longer ones. Do not write in a rhythm that sounds like a bot.

If a section has nothing interesting, say so in one short sentence. Do not manufacture significance.

When you have memory of previous days, use it. Call out if a name is appearing again, if a pattern is forming, if something reversed.

STRICT RULES — BREAKING ANY OF THESE IS A FAILURE:
1. Zero em dashes. No — anywhere. Use commas, full stops, or colons instead.
2. No "not X but Y" constructions.
3. No sentence starting with: However, Moreover, Furthermore, Additionally, Notably, Importantly, Interestingly.
4. Never use these words in any form: suggest/suggests/suggesting/suggested, indicate/indicates/indicating, appear/appears/appearing, seem/seems/seeming, "may signal", "could mean", "points to". These are ALL banned even at the end of a sentence after a comma. State conclusions as facts. Wrong: "VIX fell, indicating low tension." Right: "VIX fell. Tension is low." Wrong: "Five names hit 20%, suggesting circuit trades." Right: "Five names hit exactly 20%, the daily circuit limit. This is not organic buying." Wrong: "a circuit-limit move suggesting concentrated liquidity." Right: "a circuit-limit move, concentrated liquidity rather than broad interest." Every time you want to write 'suggesting X', instead write X as a fact.
5. No filler qualifiers: "essentially", "broadly", "generally", "particularly", "somewhat", "rather".
6. No AI vocabulary: "delve", "nuanced", "landscape", "ecosystem", "space", "framework", "underscores", "highlights".
7. No passive voice constructions like "is being seen", "was observed", "can be noted".
8. No bullet points or markdown. Plain sentences only.
9. No starting multiple consecutive sentences with "The".
10. The word "conviction" is banned in every context: do not write "lacks conviction", "high conviction", "conviction buy", or any variation. The word "signal" is banned as both noun and verb in every form: signal, signals, signaling, signalling, signaled. Do not write "X signals Y" or "signalling Z conditions". Say what the thing IS. Not "HUL signals open windows." Right: "HUL's demerger confirms that large-cap restructuring remains live."
11. Never use derogatory or dismissive terms for companies, categories, or market moves: no "garbage", "junk", "trash", "dogs", "duds", "minnows", "dregs", or similar.
12. Do not combine contradictory qualifiers. If something rose 20%, say it rose 20%. Do not write "rallied 20% flat" or similar nonsense combinations.
13. No trading-desk shorthand fragments as standalone sentences. "All action in sub-₹500Cr names" is not a sentence. Write: "All the day's movement was concentrated in sub-₹500 crore companies."

OUTPUT FORMAT:
Return only a valid JSON object with these exact 12 keys. Each value is plain prose, no markdown:

- headline: One punchy sentence, max 10 words, no full stop. What defined today for a long-term investor.
- marketSnapshot: One paragraph. Actual index numbers. What breadth looked like. One concrete observation.
- promoterComment: 1 to 2 sentences ONLY about promoter buying. Name the specific companies and amounts that stood out. If nothing interesting, say so in one sentence.
- whalesComment: 1 to 2 sentences ONLY about whale buying. Name the investor and what they bought. Mention holding change if notable. If nothing interesting, say so in one sentence.
- ratingComment: 1 sentence ONLY about rating upgrades. Name companies and agencies. If none, say so briefly.
- corporateMoves: One paragraph. Mergers, demergers, buybacks only. Do not mention fund raises here. Specific names.
- fundRaiseComment: 1 sentence ONLY about fund raises and QIPs in today's data. Name the company and what they filed. If nothing interesting, say so in one sentence.
- capexWatch: One paragraph. Who announced capex, which sector, size if known. If none today, one sentence.
- resultsComment: 1 to 2 sentences on upcoming results only. Who is reporting and why it matters.
- concallsComment: 1 sentence on upcoming concalls. Who is hosting and when.
- trending: 2 to 3 sentences. Top gainers and losers. Keep it short.
- memoryNote: 2 sentences for future memory. Names that appeared, patterns worth tracking.`;

// ─── Build data block ─────────────────────────────────────────────────────────

function buildDataBlock(ideas, markets) {
  const lines = [];

  if (markets?.headline) {
    lines.push('MARKETS TODAY:');
    const fmt = (v) => v != null ? (v >= 0 ? '+' : '') + v.toFixed(1) + '%' : '—';
    markets.headline.forEach(h => {
      if (h.change_pct !== null) {
        let line = `  ${h.display}: day ${(h.change_pct >= 0 ? '+' : '') + h.change_pct.toFixed(2)}%`;
        if (h.ret_1w  != null) line += ` | 1W ${fmt(h.ret_1w)}`;
        if (h.ret_1m  != null) line += ` | 1M ${fmt(h.ret_1m)}`;
        if (h.ret_3m  != null) line += ` | 3M ${fmt(h.ret_3m)}`;
        if (h.ret_1y  != null) line += ` | 1Y ${fmt(h.ret_1y)}`;
        lines.push(line);
      }
    });
    lines.push('');
  }

  function section(items, label) {
    if (!items || items.length === 0) {
      lines.push(`${label}: none`);
      lines.push('');
      return;
    }
    lines.push(`${label} (${items.length}):`);
    items.forEach(i => {
      let line = `  - ${i.name} (${i.ticker}) | ${i.marketCap || '?'} | ${i.sector || '?'}`;
      if (i.detail) line += ` | ${i.detail}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Promoter buying — richer format
  if (!ideas.promoterBuying || ideas.promoterBuying.length === 0) {
    lines.push('PROMOTER BUYING: none'); lines.push('');
  } else {
    lines.push(`PROMOTER BUYING (${ideas.promoterBuying.length}):`);
    ideas.promoterBuying.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.date) line += ` | date: ${i.date}`;
      if (i.amount) line += ` | amount: ₹${i.amount}L`;
      if (i.quantity) line += ` | qty: ${i.quantity}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Whales buying — show investor name and holding change
  if (!ideas.whalesBuying || ideas.whalesBuying.length === 0) {
    lines.push('WHALES BUYING: none'); lines.push('');
  } else {
    lines.push(`WHALES BUYING (${ideas.whalesBuying.length}):`);
    ideas.whalesBuying.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.whaleName) line += ` | investor: ${i.whaleName}`;
      if (i.currHolding) line += ` | holding: ${i.currHolding}`;
      if (i.prevHolding && i.prevHolding !== i.currHolding) line += ` (was ${i.prevHolding})`;
      if (i.dealType) line += ` | ${i.dealType}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Rating upgrades — show agency and rating
  if (!ideas.ratingUpgrades || ideas.ratingUpgrades.length === 0) {
    lines.push('RATING UPGRADES: none'); lines.push('');
  } else {
    lines.push(`RATING UPGRADES (${ideas.ratingUpgrades.length}):`);
    ideas.ratingUpgrades.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.agency) line += ` | ${i.agency}`;
      if (i.rating) line += ` | ${i.rating}`;
      lines.push(line);
    });
    lines.push('');
  }

  section(ideas.merger,    'MERGERS');
  section(ideas.demerger,  'DEMERGERS');
  section(ideas.buybacks,  'BUYBACKS');

  // Fund raise — show filing title if available
  if (!ideas.fundRaise || ideas.fundRaise.length === 0) {
    lines.push('FUND RAISE / QIP: none'); lines.push('');
  } else {
    lines.push(`FUND RAISE / QIP (${ideas.fundRaise.length}):`);
    ideas.fundRaise.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.filingTitle) line += ` | ${i.filingTitle}`;
      if (i.timeAgo) line += ` | ${i.timeAgo}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Capex — show filing title and AI summary
  if (!ideas.capex || ideas.capex.length === 0) {
    lines.push('CAPEX ANNOUNCEMENTS: none'); lines.push('');
  } else {
    lines.push(`CAPEX ANNOUNCEMENTS (${ideas.capex.length}):`);
    ideas.capex.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.filingTitle) line += ` | ${i.filingTitle}`;
      if (i.summary) line += `\n    Summary: ${i.summary}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Upcoming results — show date
  if (!ideas.upcomingResults || ideas.upcomingResults.length === 0) {
    lines.push('UPCOMING RESULTS: none'); lines.push('');
  } else {
    lines.push(`UPCOMING RESULTS (${ideas.upcomingResults.length}):`);
    ideas.upcomingResults.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.date) line += ` | ${i.date}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Concalls — show date and time
  if (!ideas.concalls || ideas.concalls.length === 0) {
    lines.push('CONCALLS: none'); lines.push('');
  } else {
    lines.push(`CONCALLS (${ideas.concalls.length}):`);
    ideas.concalls.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.date) line += ` | ${i.date}`;
      if (i.time) line += ` at ${i.time}`;
      lines.push(line);
    });
    lines.push('');
  }

  // Social trending
  if (ideas.trendingSocial && ideas.trendingSocial.length > 0) {
    lines.push(`TRENDING ON SOCIAL MEDIA (${ideas.trendingSocial.length}):`);
    ideas.trendingSocial.forEach(i => {
      let line = `  - ${i.name} (${i.ticker || '?'}) | ${i.marketCap || '?'}`;
      if (i.tweetText) line += `\n    Tweet: ${i.tweetText.slice(0, 200)}`;
      lines.push(line);
    });
    lines.push('');
  }

  const gainers = ideas.topGainers || [];
  if (gainers.length > 0) {
    lines.push(`TOP GAINERS (${gainers.length}):`);
    gainers.forEach(i => {
      const pct = i.pct != null ? ` +${Math.abs(i.pct).toFixed(1)}%` : '';
      lines.push(`  - ${i.name} (${i.ticker}) | ${i.marketCap || '?'} | ${i.sector || '?'}${pct}`);
    });
    lines.push('');
  }

  const losers = ideas.topLosers || [];
  if (losers.length > 0) {
    lines.push(`TOP LOSERS (${losers.length}):`);
    losers.forEach(i => {
      const pct = i.pct != null ? ` -${Math.abs(i.pct).toFixed(1)}%` : '';
      lines.push(`  - ${i.name} (${i.ticker}) | ${i.marketCap || '?'} | ${i.sector || '?'}${pct}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Static sections ──────────────────────────────────────────────────────────

function getIntro() {
  return `Every trading day, there are hundreds of things that move and most of them don't matter. This report cuts through to the signals that long-term investors actually care about: what insiders are doing with their own money, where institutions are quietly building positions, which businesses are investing in future capacity, and which fundamental screens are flagging quality. Data from Tijori Finance, published daily.`;
}

function getTijoriPitch() {
  return `All the data in this report comes from Tijori Finance. Promoter transactions, institutional stake changes, rating upgrades, capex announcements, fundamental screens. If any name caught your attention today, Tijori lets you go deeper: full promoter holding history, institutional ownership trends across quarters, custom screens across the listed universe. Visit tijorifinance.com.`;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function getFallback(ideas, markets) {
  const nifty = markets?.headline?.find(h => h.display === 'Nifty 50');
  const np    = nifty?.change_pct;
  const sign  = np != null ? (np >= 0 ? '+' : '') : '';
  return {
    headline:          np != null ? `Nifty ${np >= 0 ? 'up' : 'down'} ${sign}${np.toFixed(2)}% today` : 'Markets open, report generating',
    marketSnapshot:    np != null ? `Nifty 50 ended at ${sign}${np.toFixed(2)}%.` : 'Market data unavailable.',
    promoterComment:   ideas.promoterBuying?.length ? `${ideas.promoterBuying.length} promoter purchases today.` : 'No promoter buying today.',
    whalesComment:     ideas.whalesBuying?.length ? `${ideas.whalesBuying.length} whale transactions today.` : 'No whale activity today.',
    ratingComment:     ideas.ratingUpgrades?.length ? `${ideas.ratingUpgrades.length} rating upgrades today.` : 'No rating upgrades today.',
    corporateMoves:    'Mergers, demergers, and buybacks listed in the tables below.',
    fundRaiseComment:  ideas.fundRaise?.length ? `${ideas.fundRaise.length} fund raise filings today.` : 'No fund raise filings today.',
    capexWatch:        ideas.capex?.length ? `${ideas.capex.length} capex announcements today.` : 'No capex announcements today.',
    resultsComment:    ideas.upcomingResults?.length ? `${ideas.upcomingResults.length} companies reporting results soon.` : 'No results in the immediate calendar.',
    concallsComment:   ideas.concalls?.length ? `${ideas.concalls.length} concalls scheduled.` : 'No concalls scheduled.',
    trending:          'Gainers and losers in the tables below.',
    memoryNote:        '',
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

async function generateNarrative(data) {
  const { ideas = {}, markets, date } = data;

  const memory    = loadMemory();
  const dataBlock = buildDataBlock(ideas, markets);
  const memBlock  = buildMemoryBlock(memory);

  const userMessage = memBlock
    ? `Today is ${date}.\n\n${dataBlock}\n\n${memBlock}\n\nWrite the narrative as JSON.`
    : `Today is ${date}.\n\n${dataBlock}\n\nWrite the narrative as JSON.`;

  try {
    console.log(`   Calling Claude Sonnet (${memory.length} days of memory loaded)...`);

    const response = await client.messages.create({
      model:      'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userMessage }],
    });

    const { input_tokens, output_tokens } = response.usage;
    const costUSD = (input_tokens * 3 + output_tokens * 15) / 1_000_000;
    console.log(`   Tokens: ${input_tokens} in / ${output_tokens} out → $${costUSD.toFixed(4)} (~₹${(costUSD * 84).toFixed(2)})`);

    const text = response.content[0].text.trim();

    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) throw new Error('No JSON in Haiku response');

    const parsed = JSON.parse(jsonMatch[1]);
    console.log(`   Headline: "${parsed.headline}"`);

    if (parsed.memoryNote && date) {
      saveMemory(date, parsed.memoryNote);
      console.log(`   Memory saved for ${date}`);
    }

    return {
      ...parsed,
      intro:       getIntro(),
      tijoriPitch: getTijoriPitch(),
    };

  } catch (err) {
    console.error(`  ⚠️  Haiku narrative failed (${err.message}), using fallback`);
    return {
      ...getFallback(ideas, markets),
      intro:       getIntro(),
      tijoriPitch: getTijoriPitch(),
    };
  }
}

module.exports = { generateNarrative };
