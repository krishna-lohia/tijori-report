/**
 * Tijori Daily Investor Report — Main Generator
 *
 * Usage:
 *   node generate-report.js           → full run
 *   node generate-report.js --dry-run → fetch data only, skip HTML render
 *   node generate-report.js --ideas-only → skip markets (faster for testing)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { fetchIdeasDashboard } = require('./fetchers/ideas-dashboard');
const { generateNarrative } = require('./narrative');
const { renderReport } = require('./renderer');

const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const IDEAS_ONLY = ARGS.includes('--ideas-only');

function getDateString() {
  const d = new Date();
  // Use IST
  return new Date(d.getTime() + (5.5 * 60 * 60 * 1000))
    .toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

async function fetchAllData(date) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📅 Tijori Daily Investor Report — ${date}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const data = { date, dateFormatted: formatDate(date) };

  // Always fetch Ideas Dashboard (public, no login)
  try {
    console.log('📋 Fetching Ideas Dashboard...');
    data.ideas = await fetchIdeasDashboard();
  } catch (err) {
    console.error(`  ❌ Ideas Dashboard failed: ${err.message}`);
    data.ideas = null;
  }

  // Fetch Markets (NSE public API)
  if (!IDEAS_ONLY) {
    try {
      console.log('\n📊 Fetching Markets page...');
      const { fetchMarketsData } = require('./fetchers/markets');
      data.markets = await fetchMarketsData();
    } catch (err) {
      console.error(`  ❌ Markets fetch failed: ${err.message}`);
      data.markets = null;
    }
  } else {
    console.log('\n⏭  Skipping markets (--ideas-only flag)');
    data.markets = null;
  }

  // Screenshot each Tijori section card
  try {
    console.log('\n📸 Screenshotting Tijori section cards...');
    const { fetchSectionScreenshots } = require('./fetchers/screenshots');
    data.screenshots = await fetchSectionScreenshots();
  } catch (err) {
    console.error(`  ❌ Screenshots failed: ${err.message}`);
    data.screenshots = {};
  }

  return data;
}

async function run() {
  const date = getDateString();
  const outputDir = path.join(__dirname, 'output', date);
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    const reportData = await fetchAllData(date);

    // Log summary
    console.log('\n✅ Data fetched:');
    if (reportData.markets) {
      const fetched = reportData.markets.headline?.filter(h => h.change_pct !== null).length || 0;
      console.log(`   Market indices: ${fetched}`);
    }
    if (reportData.ideas) {
      const i = reportData.ideas;
      console.log(`   Promoter Buying: ${i.promoterBuying?.length || 0}`);
      console.log(`   Whales Buying: ${i.whalesBuying?.length || 0}`);
      console.log(`   Rating Upgrades: ${i.ratingUpgrades?.length || 0}`);
      console.log(`   Mergers/Demergers: ${i.mergerDemerger?.length || 0}`);
      console.log(`   Buybacks: ${i.buybacks?.length || 0}`);
      console.log(`   Fund Raise/QIP: ${i.fundRaise?.length || 0}`);
      console.log(`   Capex: ${i.capex?.length || 0}`);
      console.log(`   Upcoming Results: ${i.upcomingResults?.length || 0}`);
      console.log(`   Top Gainers: ${i.topGainers?.length || 0}`);
      console.log(`   Top Losers: ${i.topLosers?.length || 0}`);
    }

    // Save raw data
    const dataPath = path.join(outputDir, 'data.json');
    fs.writeFileSync(dataPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Raw data saved: output/${date}/data.json`);

    // Generate narrative
    console.log('\n📝 Generating narrative...');
    const narrative = await generateNarrative(reportData);
    reportData.narrative = narrative;

    // Save narrative separately so it survives re-renders
    fs.writeFileSync(path.join(outputDir, 'narrative.json'), JSON.stringify(narrative, null, 2));

    if (DRY_RUN) {
      console.log('\n🔍 Dry run — skipping HTML render.');
      return;
    }

    // Render HTML report
    console.log('\n🖥  Rendering HTML report...');
    const html = renderReport(reportData);
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, html);

    // Also write to latest.html at root for easy preview
    fs.writeFileSync(path.join(__dirname, 'output', 'latest.html'), html);

    // Write index.html at repo root — this is what GitHub Pages serves
    fs.writeFileSync(path.join(__dirname, 'index.html'), html);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Report complete!`);
    console.log(`📁 Output: output/${date}/index.html`);
    console.log(`🔗 Open: output/latest.html`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

run();
