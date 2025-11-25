import supabase from './_supabase.js';
import { sendJSON } from './_utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  if (req.method !== 'GET') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  try {
    const { path } = req.query;

    if (!path) {
      return sendJSON(res, 400, { error: 'Missing path parameter' });
    }

    // Extract relative path if full URL is provided
    // Assuming path might be full URL or relative path
    // If it's a full URL like https://.../storage/v1/object/public/medical-records/foo.pdf
    // We need 'foo.pdf'
    
    let filePath = path;
    if (path.includes('/medical-records/')) {
        filePath = path.split('/medical-records/')[1];
    }

    if (!filePath) {
        return sendJSON(res, 400, { error: 'Invalid path' });
    }

    const { data, error } = await supabase
      .storage
      .from('medical-records')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) {
      console.error('Signed URL Error:', error);
      return sendJSON(res, 500, { error: 'Failed to generate signed URL' });
    }

    return sendJSON(res, 200, {
      success: true,
      signed_url: data.signedUrl
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
