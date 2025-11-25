import crypto from 'crypto';
import supabase from './_supabase.js';
import { sendJSON } from './_utils.js';

const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service key as secret

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  if (req.method !== 'POST') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { patient_id, record_ids } = req.body;

    if (!patient_id || !record_ids || !Array.isArray(record_ids)) {
      return sendJSON(res, 400, { error: 'Missing required fields or invalid format' });
    }

    const grant_id = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString('hex');
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Create payload
    const payload = {
      grant_id,
      patient_id,
      records: record_ids,
      expires_at,
      nonce
    };

    // Sign payload
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    const qr_token = Buffer.from(JSON.stringify({ ...payload, signature })).toString('base64');

    // Store in grants table
    const { error: dbError } = await supabase
      .from('grants')
      .insert([
        {
          id: grant_id,
          patient_id,
          qr_token, // Store the token to verify later if needed, or just rely on signature
          expires_at,
          is_active: true,
          records: record_ids
          // doctor_email and otp_hash are null for QR grants
        }
      ]);

    if (dbError) {
      console.error('Database Error:', dbError);
      return sendJSON(res, 500, { error: 'Failed to create grant', details: dbError.message });
    }

    return sendJSON(res, 200, {
      success: true,
      qr_token
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
