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
    const { grant_id } = req.body;

    if (!grant_id) {
      return sendJSON(res, 400, { error: 'Missing grant_id' });
    }

    // Update grant to set is_active = false
    const { error: dbError } = await supabase
      .from('grants')
      .update({ is_active: false })
      .eq('id', grant_id);

    if (dbError) {
      console.error('Database Error:', dbError);
      return sendJSON(res, 500, { error: 'Failed to revoke access', details: dbError.message });
    }

    return sendJSON(res, 200, {
      success: true,
      message: 'Doctor access revoked'
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
