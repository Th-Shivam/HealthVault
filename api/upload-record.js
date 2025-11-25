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
    const { title, description, patient_id, file, fileName, fileType } = req.body;

    if (!title || !patient_id || !file || !fileName || !fileType) {
      return sendJSON(res, 400, { error: 'Missing required fields' });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file, 'base64');

    // Upload to Supabase Storage
    const filePath = `${patient_id}/${Date.now()}_${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-records')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return sendJSON(res, 500, { error: 'Failed to upload file', details: uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medical-records')
      .getPublicUrl(filePath);

    // Insert into records table
    const { data: recordData, error: dbError } = await supabase
      .from('records')
      .insert([
        {
          patient_id,
          title,
          description,
          file_url: publicUrl,
          uploaded_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return sendJSON(res, 500, { error: 'Failed to save record metadata', details: dbError.message });
    }

    return sendJSON(res, 200, {
      success: true,
      record_id: recordData.id,
      file_url: publicUrl
    });

  } catch (error) {
    console.error('Server Error:', error);
    return sendJSON(res, 500, { error: 'Internal server error', details: error.message });
  }
}
