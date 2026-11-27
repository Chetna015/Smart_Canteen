const { updateOrderStatus } = require('../../../lib/canteenStore');
const { requireVendorSession } = require('../../../lib/vendorAuth');
const { sendJson, parseJsonBody, handleApiError } = require('../../../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    requireVendorSession(req);
    const orderId = req.query && req.query.id ? String(req.query.id) : '';
    const body = await parseJsonBody(req);
    return sendJson(res, 200, await updateOrderStatus(orderId, body.status, body.pin));
  } catch (err) {
    return handleApiError(res, err);
  }
};
