/**
 * Fully automated Kite Connect login using Puppeteer + TOTP.
 * No browser popup. No manual steps.
 *
 * Flow: login → TOTP → authorize consent page → capture redirect with request_token
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const KiteConnect = require('kiteconnect').KiteConnect;
const TOTP = require('./totp');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const TOKEN_CACHE_FILE = path.join(__dirname, '../db/token_cache.json');

async function autoLogin(config) {
  const { KITE_API_KEY, KITE_API_SECRET, ZERODHA_USER_ID, ZERODHA_PASSWORD, ZERODHA_TOTP_SECRET } = config;

  if (!ZERODHA_TOTP_SECRET) {
    throw new Error('ZERODHA_TOTP_SECRET not set in config. Cannot auto-login.');
  }

  const kite = new KiteConnect({ api_key: KITE_API_KEY });
  const totp = new TOTP(ZERODHA_TOTP_SECRET);

  console.log('🔐 Starting automated Kite login...');

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Enable request interception to capture the final redirect with request_token
    await page.setRequestInterception(true);

    let redirectResolve, redirectReject;
    const redirectUrlPromise = new Promise((res, rej) => {
      redirectResolve = res;
      redirectReject = rej;
    });

    const redirectTimer = setTimeout(() => {
      redirectReject(new Error('Timeout: did not receive request_token redirect within 30s'));
    }, 30000);

    page.on('request', req => {
      const url = req.url();
      if (url.includes('request_token=')) {
        clearTimeout(redirectTimer);
        req.abort(); // Intercept — don't navigate, just grab the URL
        redirectResolve(url);
      } else {
        req.continue();
      }
    });

    // Step 1: Navigate to Kite login
    const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${KITE_API_KEY}`;
    console.log('   Navigating to login page...');
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    // Step 2: Fill username + password
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.type('input[type="text"]', ZERODHA_USER_ID, { delay: 80 });
    await page.type('input[type="password"]', ZERODHA_PASSWORD, { delay: 80 });
    await page.click('button[type="submit"]');
    console.log('   Credentials submitted...');

    // Step 3: Enter TOTP
    await page.waitForSelector('input[maxlength="6"]', { timeout: 10000 });
    const totpCode = await totp.getFreshToken();
    console.log('   Entering TOTP...');
    await page.type('input[maxlength="6"]', totpCode, { delay: 80 });
    try { await page.click('button[type="submit"]'); } catch (_) {}

    // Step 4: Wait for redirect — Kite redirects directly after TOTP
    console.log('   Waiting for redirect...');
    const redirectUrl = await redirectUrlPromise;

    await browser.close();
    browser = null;

    // Step 5: Extract request_token and exchange for access_token
    const urlParams = new URLSearchParams(new URL(redirectUrl).search);
    const requestToken = urlParams.get('request_token');
    if (!requestToken) throw new Error('request_token missing from redirect URL');

    console.log('   Generating access token...');
    const session = await kite.generateSession(requestToken, KITE_API_SECRET);

    // Cache until midnight IST (Kite tokens expire at midnight)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const midnight = new Date(istNow);
    midnight.setHours(24, 0, 0, 0);
    const expiresAt = new Date(midnight.getTime() - istOffset);

    const tokenData = {
      access_token: session.access_token,
      user_id: session.user_id,
      generated_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    fs.mkdirSync(path.dirname(TOKEN_CACHE_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(tokenData, null, 2));

    console.log(`✅ Auto-login successful! (user: ${session.user_id}, expires: ${tokenData.expires_at})`);
    return tokenData;

  } catch (err) {
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: '/tmp/kite-login-error.png' });
          console.error('   Screenshot: /tmp/kite-login-error.png');
        }
      } catch (_) {}
      await browser.close();
    }
    throw err;
  }
}

function loadCachedToken() {
  try {
    if (!fs.existsSync(TOKEN_CACHE_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf8'));
    if (new Date() < new Date(data.expires_at)) return data;
    return null;
  } catch (_) {
    return null;
  }
}

module.exports = { autoLogin, loadCachedToken };
