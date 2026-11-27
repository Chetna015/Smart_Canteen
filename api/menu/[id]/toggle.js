const { toggleMenuStock } = require('../../../lib/canteenStore');
const { requireVendorSession } = require('../../../lib/vendorAuth');
const { sendJson, handleApiError } = require('../../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    requireVendorSession(req);
    const itemId = req.query && req.query.id ? String(req.query.id) : '';
    return sendJson(res, 200, await toggleMenuStock(itemId));
  } catch (err) {
    return handleApiError(res, err);
  }
};
