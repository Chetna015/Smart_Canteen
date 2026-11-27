const { loadLocalEnv } = require('./env');

function getConfig() {
  loadLocalEnv();
  const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, secretKey, enabled: Boolean(url && secretKey) };
}

function buildHeaders(secretKey, extra = {}) {
  const headers = {
    apikey: secretKey,
    'Content-Type': 'application/json',
    ...extra,
  };
  // Only legacy JWT service_role keys use Bearer; sb_secret_ keys must only be sent via apikey.
  if (!secretKey.startsWith('sb_')) {
    headers.Authorization = `Bearer ${secretKey}`;
  }
  return headers;
}

async function supabaseRequest(restPath, options = {}) {
  const { url, secretKey, enabled } = getConfig();
  if (!enabled) {
    throw new Error('Supabase credentials are not configured.');
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 4500;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(`${url}/rest/v1/${restPath}`, {
      method: options.method || 'GET',
      headers: buildHeaders(secretKey, options.headers || {}),
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      const timeoutErr = new Error('Supabase request timed out.');
      timeoutErr.code = 'ETIMEDOUT';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let msg = (data && (data.message || data.hint || data.details)) || `Supabase error (${res.status})`;
    if (data && data.code === '42501') {
      msg = 'Supabase permission denied (42501). Run the GRANT statements at the bottom of supabase/schema.sql in Supabase SQL Editor.';
    }
    const err = new Error(msg);
    err.statusCode = res.status;
    err.code = data && data.code;
    throw err;
  }

  return data;
}

module.exports = { getConfig, supabaseRequest };
