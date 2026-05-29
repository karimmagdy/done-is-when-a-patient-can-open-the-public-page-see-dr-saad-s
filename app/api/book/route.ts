import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPatientConfirmation, sendTherapistNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, notes, date, start_time, end_time, displayDate, displayTime } = body;

  if (!name || !email || !date || !start_time || !end_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const schema = 'user_312a098d';

  // Check slot still available
  const { data: existing } = await admin
    .schema(schema as 'public')
    .from('appointments')
    .select('id')
    .eq('appointment_date', date)
    .eq('start_time', start_time)
    .eq('status', 'confirmed')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'This slot was just taken. Please choose another time.' }, { status: 409 });
  }

  const { data: appointment, error } = await admin
    .schema(schema as 'public')
    .from('appointments')
    .insert({
      patient_name: name,
      patient_email: email,
      patient_phone: phone || null,
      appointment_date: date,
      start_time,
      end_time,
      status: 'confirmed',
      payment_status: 'pay_at_session',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save booking. Please try again.' }, { status: 500 });
  }

  // Send emails (non-blocking)
  Promise.all([
    sendPatientConfirmation({ name, email, displayDate, displayTime }),
    sendTherapistNotification({ patientName: name, patientEmail: email, displayDate, displayTime, phone, notes }),
  ]).catch(() => {});

  return NextResponse.json({ ok: true, appointment });
}
