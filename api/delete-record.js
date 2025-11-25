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
    const { record_id, file_path, patient_id } = req.body;

    // Validate required fields
    if (!record_id || !file_path || !patient_id) {
      return sendJSON(res, 400, { error: 'Missing required fields: record_id, file_path, and patient_id are required' });
    }

    // Validate patient using JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return sendJSON(res, 401, { error: 'Unauthorized: Missing authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token contains valid session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Invalid token:', authError?.message);
      return sendJSON(res, 401, { error: 'Unauthorized: Invalid token' });
    }

    // Security check: Verify the record belongs to the authenticated patient
    const { data: record, error: fetchError } = await supabase
      .from('records')
      .select('*')
      .eq('id', record_id)
      .eq('patient_id', user.id)
      .single();

    if (fetchError || !record) {
      console.error('Record not found or unauthorized:', fetchError?.message);
      return sendJSON(res, 403, { error: 'Forbidden: Record does not belong to this patient or does not exist' });
    }

    console.log('Deleting record:', record_id, 'for patient:', user.id);

    // Extract the file path from the file_url if needed
    let storagePath = file_path;
    if (file_path.includes('/medical-records/')) {
      storagePath = file_path.split('/medical-records/')[1];
    }

    console.log('Deleting file from storage:', storagePath);

    // Delete file from Supabase Storage
    const { error: storageError } = await supabase
      .storage
      .from('medical-records')
      .remove([storagePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with DB deletion even if storage fails (file might already be deleted)
      console.warn('Storage deletion failed, continuing with DB deletion');
    }

    // Delete the DB row
    const { error: deleteError } = await supabase
      .from('records')
      .delete()
      .eq('id', record_id)
      .eq('patient_id', user.id);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      return sendJSON(res, 500, { error: 'Failed to delete record from database' });
    }

    console.log('Record deleted successfully:', record_id);

    return sendJSON(res, 200, {
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
