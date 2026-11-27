const http = require('http');
const fs = require('fs');
const path = require('path');

const { loadLocalEnv } = require('./lib/env');
const { getConfig } = require('./lib/supabaseClient');
const {
  getLanUrls,
  getPublicSnapshot,
  createOrder,
  createWalkin,
  updateOrderStatus,
  toggleMenuStock,
  simulateRush,
  resetDemo,
} = require('./lib/canteenStore');
const {
  authenticateVendor,
  getDemoVendor,
  createSessionToken,
  getVendorSession,
  requireVendorSession,
  buildSessionCookie,
} = require('./lib/vendorAuth');
const { sendJson, parseJsonBody, handleApiError } = require('./lib/httpHelpers');

loadLocalEnv();

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

async function handleApi(req, res, pathname) {
  try {
    if (req.method === 'GET' && pathname === '/api/state') {
      return sendJson(res, 200, await getPublicSnapshot());
    }

    if (req.method === 'GET' && pathname === '/api/events') {
      res.writeHead(410, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end('SSE disabled; using /api/state polling.');
    }

    if (req.method === 'GET' && pathname === '/api/vendor/session') {
      const vendor = getVendorSession(req);
      return sendJson(res, 200, { authenticated: Boolean(vendor), vendor: vendor || null });
    }

    if (req.method === 'POST' && pathname === '/api/vendor/login') {
      const body = await parseJsonBody(req);
      const vendor = authenticateVendor(body.username, body.password);
      if (!vendor) {
        return sendJson(res, 401, { error: 'Invalid vendor username or password.' });
      }
      const token = createSessionToken(vendor);
      return sendJson(
        res,
        200,
        { authenticated: true, vendor },
        { 'Set-Cookie': buildSessionCookie(req, token) }
      );
    }

    if (req.method === 'POST' && pathname === '/api/vendor/demo-login') {
      const vendor = getDemoVendor();
      const token = createSessionToken(vendor);
      return sendJson(
        res,
        200,
        { authenticated: true, vendor },
        { 'Set-Cookie': buildSessionCookie(req, token) }
      );
    }

    if (req.method === 'POST' && pathname === '/api/vendor/logout') {
      return sendJson(
        res,
        200,
        { authenticated: false, vendor: null },
        { 'Set-Cookie': buildSessionCookie(req, '', 0) }
      );
    }

    if (req.method === 'POST' && pathname === '/api/orders') {
      const body = await parseJsonBody(req);
      return sendJson(res, 201, await createOrder(body));
    }

    if (req.method === 'POST' && pathname === '/api/walkin') {
      requireVendorSession(req);
      const body = await parseJsonBody(req);
      return sendJson(res, 201, await createWalkin(body));
    }

    const orderStatusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (req.method === 'PATCH' && orderStatusMatch) {
      requireVendorSession(req);
      const orderId = decodeURIComponent(orderStatusMatch[1]);
      const body = await parseJsonBody(req);
      return sendJson(res, 200, await updateOrderStatus(orderId, body.status, body.pin));
    }

    const menuToggleMatch = pathname.match(/^\/api\/menu\/([^/]+)\/toggle$/);
    if (req.method === 'PATCH' && menuToggleMatch) {
      requireVendorSession(req);
      const itemId = decodeURIComponent(menuToggleMatch[1]);
      return sendJson(res, 200, await toggleMenuStock(itemId));
    }

    if (req.method === 'POST' && pathname === '/api/demo/rush') {
      requireVendorSession(req);
      return sendJson(res, 200, await simulateRush());
    }

    if (req.method === 'POST' && pathname === '/api/demo/reset') {
      requireVendorSession(req);
      return sendJson(res, 200, await resetDemo());
    }

    return sendJson(res, 404, { error: 'API route not found.' });
  } catch (err) {
    return handleApiError(res, err);
  }
}

function serveStatic(res, pathname) {
  if (pathname === '/favicon.ico') {
    res.writeHead(204, { 'Cache-Control': 'public, max-age=86400' });
    return res.end();
  }

  const safePath = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.normalize(path.join(PUBLIC_DIR, safePath));
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(resolved, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const ext = path.extname(resolved).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.svg', '.ico'].includes(ext);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': isImage ? 'public, max-age=86400' : 'no-store, must-revalidate',
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (pathname.startsWith('/api/')) {
    return handleApi(req, res, pathname);
  }
  return serveStatic(res, pathname);
});

server.listen(PORT, () => {
  const lanUrls = getLanUrls(PORT);
  const dbMode = getConfig().enabled ? 'Supabase (Cloud DB)' : 'In-Memory Fallback';
  console.log('\n======================================================');
  console.log('  QuickLunch - Smart Canteen Queue & Token System');
  console.log(`  Storage Backend:   ${dbMode}`);
  console.log('======================================================');
  console.log(`  Local Browser:     http://localhost:${PORT}`);
  console.log(`  Examiner Split:    http://localhost:${PORT}/?view=demo`);
  console.log(`  Printable QR Card: http://localhost:${PORT}/?view=qr`);
  if (lanUrls.length > 0) {
    console.log('\n  Phone QR / Same Wi-Fi URLs:');
    for (const entry of lanUrls) {
      console.log(`   -> ${entry.url}  (${entry.interface})`);
    }
  }
  console.log('\n  Press Ctrl+C to stop the prototype server.\n');
});
