const { getVendorSession } = require('../../lib/vendorAuth');
const { sendJson, handleApiError } = require('../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    const vendor = getVendorSession(req);
    return sendJson(res, 200, {
      authenticated: Boolean(vendor),
      vendor: vendor || null,
    });
  } catch (err) {
    return handleApiError(res, err);
  }
};
