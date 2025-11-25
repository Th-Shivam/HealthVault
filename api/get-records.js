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
      console.error('Missing or invalid authorization header');
      return sendJSON(res, 401, { error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
      console.log('Grant ID from token:', decoded.grant_id);
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return sendJSON(res, 401, { error: 'Unauthorized' });
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
      console.error('Grant validation failed:', grantError?.message || 'Grant not found');
      return sendJSON(res, 401, { error: 'Unauthorized' });
    }

    console.log('Grant validated:', grant_id);
    console.log('Doctor email:', grant.doctor_email);

    const recordIds = grant.records; // Array of record IDs

    // If no records, return empty array
    if (!recordIds || recordIds.length === 0) {
      console.log('No records in grant');
      return sendJSON(res, 200, {
        success: true,
        records: [],
        grant_id: grant_id,
        doctor_email: grant.doctor_email || null
      });
    }

    // Fetch records - MUST include uploaded_at
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('id, title, description, file_url, uploaded_at')
      .in('id', recordIds);

    if (recordsError) {
      console.error('Database Error fetching records:', recordsError);
      return sendJSON(res, 500, { error: 'Failed to fetch records' });
    }

    console.log('Records fetched:', records.length);

    // Generate signed URLs for each record
    const recordsWithSignedUrls = await Promise.all(records.map(async (record) => {
      // Extract file path from public URL
      // Format: https://.../storage/v1/object/public/medical-records/path/to/file
      const urlParts = record.file_url.split('/medical-records/');
      if (urlParts.length < 2) {
        console.error('Invalid file_url format for record:', record.id);
        return {
          id: record.id,
          title: record.title || 'Untitled',
          description: record.description || '',
          file_url: record.file_url,
          signed_url: record.file_url, // Fallback to original URL
          uploaded_at: record.uploaded_at || new Date().toISOString()
        };
      }

      const filePath = urlParts[1];

      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('medical-records')
        .createSignedUrl(filePath, 3600); // Valid for 1 hour

      if (signedError) {
        console.error('Signed URL Error for record', record.id, ':', signedError);
        return {
          id: record.id,
          title: record.title || 'Untitled',
          description: record.description || '',
          file_url: record.file_url,
          signed_url: record.file_url, // Fallback to original URL
          uploaded_at: record.uploaded_at || new Date().toISOString()
        };
      }

      console.log('Signed URL generated for record:', record.id, signedData.signedUrl);

      return {
        id: record.id,
        title: record.title || 'Untitled',
        description: record.description || '',
        file_url: record.file_url,
        signed_url: signedData.signedUrl, // Store as separate field
        uploaded_at: record.uploaded_at || new Date().toISOString()
      };
    }));

    console.log('Returning', recordsWithSignedUrls.length, 'records with signed URLs');

    return sendJSON(res, 200, {
      success: true,
      records: recordsWithSignedUrls,
      grant_id: grant_id,
      doctor_email: grant.doctor_email || null
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
