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
    const { grant_id, doctor_id, record_id } = req.body;

    if (!grant_id || !record_id) {
      return sendJSON(res, 400, { error: 'Missing required fields' });
    }

    // Insert into access_logs table
    const { error: dbError } = await supabase
      .from('access_logs')
      .insert([
        {
          grant_id,
          doctor_id, // Can be null if not available
          record_id,
          accessed_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      console.error('Database Error:', dbError);
      return sendJSON(res, 500, { error: 'Failed to log access', details: dbError.message });
    }

    return sendJSON(res, 200, {
      success: true
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
