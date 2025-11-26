import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set. Email notifications will not be sent.');
}

/**
 * Send real-time access notification email to patient
 * @param {string} patientEmail - Patient's email address
 * @param {string} doctorEmail - Doctor's email address
 * @param {string} recordTitle - Title of the accessed record
 * @param {string} accessedAt - Timestamp when record was accessed
 */
export async function sendAccessNotification(patientEmail, doctorEmail, recordTitle, accessedAt) {
  if (!SENDGRID_API_KEY) {
    console.warn('Skipping email notification - SENDGRID_API_KEY not configured');
    return;
  }

  const formattedDate = new Date(accessedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const msg = {
    to: patientEmail,
    from: 'noreply@healthvault.app', // Replace with your verified sender email
    subject: '🔔 Someone accessed your HealthVault record',
    text: `Hello,

This is to notify you that your medical record was accessed.

📄 Record: ${recordTitle}
👨‍⚕️ Accessed by: ${doctorEmail}
🕒 Time: ${formattedDate}

If you did not authorize this access, please revoke it immediately from your Dashboard.

View your Dashboard: ${process.env.VITE_APP_URL || 'https://healthvault.vercel.app'}/dashboard

---
HealthVault - Your Secure Digital Health Locker`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #4f46e5; margin-top: 0;">🔔 Record Access Notification</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This is to notify you that your medical record was accessed.
          </p>
          
          <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0; color: #1f2937;"><strong>📄 Record:</strong> ${recordTitle}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>👨‍⚕️ Accessed by:</strong> ${doctorEmail}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>🕒 Time:</strong> ${formattedDate}</p>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b;">
              <strong>⚠️ Security Alert:</strong> If you did not authorize this access, please revoke it immediately from your Dashboard.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VITE_APP_URL || 'https://healthvault.vercel.app'}/dashboard" 
               style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            HealthVault - Your Secure Digital Health Locker
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Access notification email sent to ${patientEmail}`);
  } catch (error) {
    console.error('Error sending access notification email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    // Don't throw - we don't want email failures to break the API
  }
}

/**
 * Send weekly digest email to patient
 * @param {string} patientEmail - Patient's email address
 * @param {Object} accessSummary - Summary of access activity
 */
export async function sendWeeklyDigest(patientEmail, accessSummary) {
  if (!SENDGRID_API_KEY) {
    console.warn('Skipping weekly digest - SENDGRID_API_KEY not configured');
    return;
  }

  const { totalViews, doctorCount, recentActivity } = accessSummary;

  const activityList = recentActivity
    .map(
      (activity) =>
        `<li style="margin: 10px 0; color: #374151;">
          <strong>${activity.recordTitle}</strong> viewed by ${activity.doctorEmail} on ${new Date(activity.accessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </li>`
    )
    .join('');

  const msg = {
    to: patientEmail,
    from: 'noreply@healthvault.app', // Replace with your verified sender email
    subject: '📊 Your HealthVault Weekly Activity Summary',
    text: `Hello,

Here's a summary of activity on your HealthVault account this week:

📈 Total Record Views: ${totalViews}
👨‍⚕️ Doctors who accessed: ${doctorCount}

Manage your access grants: ${process.env.VITE_APP_URL || 'https://healthvault.vercel.app'}/dashboard

---
HealthVault - Your Secure Digital Health Locker`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #4f46e5; margin-top: 0;">📊 Weekly Activity Summary</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Here's a summary of activity on your HealthVault account this week:
          </p>
          
          <div style="display: flex; gap: 20px; margin: 30px 0;">
            <div style="flex: 1; background-color: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 0;">${totalViews}</p>
              <p style="color: #1e40af; margin: 10px 0 0 0;">Total Views</p>
            </div>
            <div style="flex: 1; background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #16a34a; margin: 0;">${doctorCount}</p>
              <p style="color: #15803d; margin: 10px 0 0 0;">Doctors Accessed</p>
            </div>
          </div>
          
          ${
            recentActivity.length > 0
              ? `
          <h3 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Recent Activity</h3>
          <ul style="list-style: none; padding: 0;">
            ${activityList}
          </ul>
          `
              : ''
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.VITE_APP_URL || 'https://healthvault.vercel.app'}/dashboard" 
               style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Manage Access Grants
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            HealthVault - Your Secure Digital Health Locker
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Weekly digest email sent to ${patientEmail}`);
  } catch (error) {
    console.error('Error sending weekly digest email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
  }
}
