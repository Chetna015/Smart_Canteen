const { buildSessionCookie } = require('../../lib/vendorAuth');
const { sendJson, handleApiError } = require('../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    return sendJson(
      res,
      200,
      { authenticated: false, vendor: null },
      { 'Set-Cookie': buildSessionCookie(req, '', 0) }
    );
  } catch (err) {
    return handleApiError(res, err);
  }
};
