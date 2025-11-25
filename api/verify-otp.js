import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import supabase from './_supabase.js';
import { sendJSON } from './_utils.js';

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service key as secret for simplicity

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  if (req.method !== 'POST') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { doctor_email, otp } = req.body;

    if (!doctor_email || !otp) {
      return sendJSON(res, 400, { error: 'Missing required fields' });
    }

    // Hash the provided OTP
    const otp_hash = crypto.createHash('sha256').update(otp).digest('hex');

    // Find matching grant
    const { data: grants, error: dbError } = await supabase
      .from('grants')
      .select('*')
      .eq('doctor_email', doctor_email)
      .eq('otp_hash', otp_hash)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (dbError) {
      console.error('Database Error:', dbError);
      return sendJSON(res, 500, { error: 'Database error', details: dbError.message });
    }

    if (!grants || grants.length === 0) {
      return sendJSON(res, 401, { error: 'Invalid or expired OTP' });
    }

    const grant = grants[0];

    // Generate JWT
    const token = jwt.sign(
      {
        grant_id: grant.id,
        doctor_email: grant.doctor_email,
        role: 'doctor_access'
      },
      JWT_SECRET,
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
