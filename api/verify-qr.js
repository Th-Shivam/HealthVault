import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import supabase from './_supabase.js';
import { sendJSON } from './_utils.js';

const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  if (req.method !== 'POST') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { qr_token } = req.body;

    if (!qr_token) {
      return sendJSON(res, 400, { error: 'Missing QR token' });
    }

    // Decode token
    const tokenJson = Buffer.from(qr_token, 'base64').toString('utf-8');
    const payload = JSON.parse(tokenJson);
    const { signature, ...data } = payload;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(JSON.stringify(data))
      .digest('hex');

    if (signature !== expectedSignature) {
      return sendJSON(res, 401, { error: 'Invalid token signature' });
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      return sendJSON(res, 401, { error: 'QR token has expired' });
    }

    // Check if grant exists and is active
    const { data: grant, error: dbError } = await supabase
      .from('grants')
      .select('*')
      .eq('id', data.grant_id)
      .eq('is_active', true)
      .single();

    if (dbError || !grant) {
      return sendJSON(res, 401, { error: 'Invalid or inactive grant' });
    }

    // Issue JWT
    const token = jwt.sign(
      {
        grant_id: grant.id,
        method: 'qr',
        role: 'doctor_access'
      },
      SECRET_KEY,
      { expiresIn: '15m' }
    );

    return sendJSON(res, 200, {
      success: true,
      token
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
