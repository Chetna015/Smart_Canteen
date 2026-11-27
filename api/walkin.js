const { createWalkin } = require('../lib/canteenStore');
const { requireVendorSession } = require('../lib/vendorAuth');
const { sendJson, parseJsonBody, handleApiError } = require('../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    requireVendorSession(req);
    const body = await parseJsonBody(req);
    return sendJson(res, 201, await createWalkin(body));
  } catch (err) {
    return handleApiError(res, err);
  }
};
