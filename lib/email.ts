import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Dr. Saad El Mahdy <onboarding@resend.dev>';
const THERAPIST_EMAIL = process.env.THERAPIST_EMAIL || 'dr.saad@example.com';

export async function sendPatientConfirmation({
  name, email, displayDate, displayTime,
}: { name: string; email: string; displayDate: string; displayTime: string }) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Booking confirmed — ${displayDate}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; color: #222;">
        <div style="background: #1a5c4e; padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Your session is confirmed ✔</h1>
        </div>
        <div style="background: #f9f9f7; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e0;">
          <p style="margin: 0 0 20px;">Dear ${name},</p>
          <p style="margin: 0 0 20px;">Your therapy session with <strong>Dr. Saad El Mahdy, MD</strong> has been booked. Here are your details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666; width: 40%;">Date</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; font-weight: bold;">${displayDate}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Time</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; font-weight: bold;">${displayTime}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Duration</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8;">50 minutes</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Session type</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8;">In-person, 1-on-1</td></tr>
            <tr><td style="padding: 10px 0; color: #666;">Payment</td><td style="padding: 10px 0; color: #b45309; font-weight: bold;">Pay at session</td></tr>
          </table>
          <p style="margin: 0 0 8px; font-size: 13px; color: #888;">If you need to cancel or have any questions, please reply to this email or contact Dr. Saad directly.</p>
          <p style="margin: 24px 0 0; font-size: 13px; color: #aaa;">Dr. Saad El Mahdy — Psychiatrist &amp; Psychotherapist</p>
        </div>
      </div>
    `,
  });
}

export async function sendTherapistNotification({
  patientName, patientEmail, displayDate, displayTime, phone, notes,
}: { patientName: string; patientEmail: string; displayDate: string; displayTime: string; phone?: string; notes?: string }) {
  if (!process.env.RESEND_API_KEY) return;

  await resend.emails.send({
    from: FROM,
    to: THERAPIST_EMAIL,
    subject: `New booking: ${patientName} — ${displayDate}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; color: #222;">
        <div style="background: #1a5c4e; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New session booked 📅</h1>
        </div>
        <div style="background: #f9f9f7; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e8e8e0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666; width: 40%;">Patient</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; font-weight: bold;">${patientName}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8;">${patientEmail}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8;">${phone || '—'}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Date</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; font-weight: bold;">${displayDate}</td></tr>
            <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; color: #666;">Time</td><td style="padding: 10px 0; border-bottom: 1px solid #e0e0d8; font-weight: bold;">${displayTime}</td></tr>
            <tr><td style="padding: 10px 0; color: #666;">Notes</td><td style="padding: 10px 0;">${notes || '—'}</td></tr>
          </table>
        </div>
      </div>
    `,
  });
}
