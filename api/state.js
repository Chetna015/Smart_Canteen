const { getPublicSnapshot } = require('../lib/canteenStore');
const { sendJson, handleApiError } = require('../lib/httpHelpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  try {
    return sendJson(res, 200, await getPublicSnapshot());
  } catch (err) {
    return handleApiError(res, err);
  }
};
