const { getDemoVendor, createSessionToken, buildSessionCookie } = require('../../lib/vendorAuth');
const { sendJson, handleApiError } = require('../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    const vendor = getDemoVendor();
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
