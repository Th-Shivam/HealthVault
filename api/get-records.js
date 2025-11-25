import jwt from 'jsonwebtoken';
import supabase from './_supabase.js';
import { sendJSON } from './_utils.js';

const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, {});
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJSON(res, 401, { error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return sendJSON(res, 401, { error: 'Invalid or expired token' });
    }

    const { grant_id } = decoded;

    // Fetch grant
    const { data: grant, error: grantError } = await supabase
      .from('grants')
      .select('*')
      .eq('id', grant_id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (grantError || !grant) {
      return sendJSON(res, 403, { error: 'Access denied: Invalid or expired grant' });
    }

    const recordIds = grant.records; // Array of record IDs

    if (!recordIds || recordIds.length === 0) {
      return sendJSON(res, 200, { records: [] });
    }

    // Fetch records
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('id, title, description, file_url')
      .in('id', recordIds);

    if (recordsError) {
      console.error('Database Error:', recordsError);
      return sendJSON(res, 500, { error: 'Failed to fetch records' });
    }

    // Generate signed URLs for each record
    const recordsWithSignedUrls = await Promise.all(records.map(async (record) => {
      // Extract file path from public URL
      // Format: https://.../storage/v1/object/public/medical-records/path/to/file
      const urlParts = record.file_url.split('/medical-records/');
      if (urlParts.length < 2) return record; // Should not happen if URL is correct

      const filePath = urlParts[1];

      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('medical-records')
        .createSignedUrl(filePath, 60 * 60); // Valid for 1 hour

      if (signedError) {
        console.error('Signed URL Error:', signedError);
        return record; // Fallback to public URL or handle error
      }

      return {
        ...record,
        file_url: signedData.signedUrl // Replace public URL with signed URL
      };
    }));

    return sendJSON(res, 200, {
      success: true,
      records: recordsWithSignedUrls,
      grant_id: grant_id,
      doctor_email: grant.doctor_email
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
