const { authenticateVendor, createSessionToken, buildSessionCookie } = require('../../lib/vendorAuth');
const { sendJson, parseJsonBody, handleApiError } = require('../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
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
  } catch (err) {
    return handleApiError(res, err);
  }
};
