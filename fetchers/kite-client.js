/**
 * Kite Connect client for tijori-report.
 * Fully self-sufficient: auto-logins via Puppeteer + TOTP when the token is
 * expired or missing. No manual steps required.
 *
 * Token priority:
 *   1. Own cache (db/token_cache.json)
 *   2. Shared aftermarket-pipeline cache (if running on the same machine)
 *   3. Fresh auto-login
 */

const KiteConnect = require('kiteconnect').KiteConnect;
const fs          = require('fs');
const path        = require('path');

const OWN_CACHE    = path.join(__dirname, '../db/token_cache.json');
const SHARED_CACHE = '/home/krishna.lohia/aftermarket-pipeline/db/token_cache.json';

let kiteInstance = null;

function readCache(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (new Date() < new Date(data.expires_at)) return data;
    return null; // expired
  } catch (_) {
    return null;
  }
}

async function getKite() {
  if (kiteInstance) return kiteInstance;

  const config = require('../config');

  // 1. Try own cache
  let tokenData = readCache(OWN_CACHE);
  if (tokenData) {
    console.log(`  ✓ Kite token loaded from own cache (user: ${tokenData.user_id}, expires: ${tokenData.expires_at})`);
  }

  // 2. Try shared aftermarket-pipeline cache
  if (!tokenData) {
    tokenData = readCache(SHARED_CACHE);
    if (tokenData) {
      console.log(`  ✓ Kite token loaded from shared cache (user: ${tokenData.user_id}, expires: ${tokenData.expires_at})`);
    }
  }

  // 3. Auto-login
  if (!tokenData) {
    console.log('  ℹ️  No valid Kite token found. Performing auto-login...');
    const { autoLogin } = require('../auth/auto-login');
    tokenData = await autoLogin(config);
  }

  kiteInstance = new KiteConnect({ api_key: config.KITE_API_KEY });
  kiteInstance.setAccessToken(tokenData.access_token);
  return kiteInstance;
}

module.exports = { getKite };
