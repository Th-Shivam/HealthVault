import { sendJSON } from './_utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  return sendJSON(res, 200, { message: 'Hello from HealthVault API!' });
}
