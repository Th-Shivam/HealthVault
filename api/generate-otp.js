import crypto from 'crypto';
import supabase from './_supabase.js';
import { sendJSON } from './_utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  if (req.method !== 'POST') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { patient_id, doctor_email, record_ids } = req.body;

    if (!patient_id || !doctor_email || !record_ids || !Array.isArray(record_ids)) {
      return sendJSON(res, 400, { error: 'Missing required fields or invalid format' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP using SHA-256
    const otp_hash = crypto.createHash('sha256').update(otp).digest('hex');

    // Calculate expiration time (15 minutes from now)
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store in grants table
    const { error: dbError } = await supabase
      .from('grants')
      .insert([
        {
          patient_id,
          doctor_email,
          otp_hash,
          expires_at,
          is_active: true,
          records: record_ids
        }
      ]);

    if (dbError) {
      console.error('Database Error:', dbError);
      return sendJSON(res, 500, { error: 'Failed to create grant', details: dbError.message });
    }

    return sendJSON(res, 200, {
      success: true,
      otp // Return the plain OTP to the user
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
