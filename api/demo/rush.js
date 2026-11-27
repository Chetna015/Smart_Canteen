const { simulateRush } = require('../../lib/canteenStore');
const { requireVendorSession } = require('../../lib/vendorAuth');
const { sendJson, handleApiError } = require('../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    requireVendorSession(req);
    return sendJson(res, 200, await simulateRush());
  } catch (err) {
    return handleApiError(res, err);
  }
};
