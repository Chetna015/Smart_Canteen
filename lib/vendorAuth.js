const crypto = require('crypto');
const { loadLocalEnv } = require('./env');

const COOKIE_NAME = 'ql_vendor_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getVendorAccounts() {
  loadLocalEnv();
  return [
    {
      username: process.env.VENDOR_USERNAME || 'vendor',
      password: process.env.VENDOR_PASSWORD || 'bbs@2026',
      role: 'vendor',
      displayName: 'Canteen Vendor',
    },
    {
      username: process.env.DEMO_VENDOR_USERNAME || 'demovendor',
      password: process.env.DEMO_VENDOR_PASSWORD || 'demo@1234',
      role: 'demo',
      displayName: 'Demo Vendor',
    },
  ];
}

function getAuthSecret() {
  loadLocalEnv();
  return (
    process.env.VENDOR_AUTH_SECRET
    || process.env.SUPABASE_SECRET_KEY
    || 'quicklunch-bbscet-vendor-secret-2026'
  );
}

function safeEqualText(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function authenticateVendor(username, password) {
  const cleanUser = String(username || '').trim();
  const cleanPass = String(password || '');
  if (!cleanUser || !cleanPass) return null;

  for (const account of getVendorAccounts()) {
    if (safeEqualText(cleanUser, account.username) && safeEqualText(cleanPass, account.password)) {
      return {
        username: account.username,
        role: account.role,
        displayName: account.displayName,
      };
    }
  }
  return null;
}

function signPayload(payloadB64) {
  return crypto
    .createHmac('sha256', getAuthSecret())
    .update(payloadB64)
    .digest('base64url');
}

function createSessionToken(vendor) {
  const payload = {
    username: vendor.username,
    role: vendor.role,
    displayName: vendor.displayName,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;

  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = signPayload(payloadB64);

  if (!safeEqualText(sig, expectedSig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload || !payload.username || !payload.exp || Date.now() > Number(payload.exp)) {
      return null;
    }
    return {
      username: payload.username,
      role: payload.role,
      displayName: payload.displayName,
    };
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const raw = req && req.headers ? req.headers.cookie : '';
  const out = {};
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

function getVendorSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME] || (req && req.headers && req.headers['x-vendor-token']);
  return verifySessionToken(token);
}

function requireVendorSession(req) {
  const session = getVendorSession(req);
  if (!session) {
    const err = new Error('Vendor authentication required. Please sign in.');
    err.statusCode = 401;
    throw err;
  }
  return session;
}

function buildSessionCookie(req, token, maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000)) {
  const isHttps = Boolean(
    (req && req.headers && req.headers['x-forwarded-proto'] === 'https')
    || (req && req.socket && req.socket.encrypted)
  );
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

function getDemoVendor() {
  const demo = getVendorAccounts().find((a) => a.role === 'demo');
  return {
    username: demo.username,
    role: demo.role,
    displayName: demo.displayName,
  };
}

module.exports = {
  authenticateVendor,
  getDemoVendor,
  createSessionToken,
  getVendorSession,
  requireVendorSession,
  buildSessionCookie,
};
