const { createOrder } = require('../lib/canteenStore');
const { sendJson, parseJsonBody, handleApiError } = require('../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    const body = await parseJsonBody(req);
    return sendJson(res, 201, await createOrder(body));
  } catch (err) {
    return handleApiError(res, err);
  }
};
