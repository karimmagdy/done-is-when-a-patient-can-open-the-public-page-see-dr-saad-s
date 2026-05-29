import { supabaseAdmin } from './supabase';

export async function ensureSchema() {
  const admin = supabaseAdmin();
  const schema = 'user_312a098d';

  await admin.rpc('exec_sql', {
    sql: `
      SET search_path TO "${schema}", public;

      CREATE TABLE IF NOT EXISTS "${schema}".availability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        session_duration_minutes INTEGER NOT NULL DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${schema}".blocked_dates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocked_date DATE NOT NULL UNIQUE,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${schema}".appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_name TEXT NOT NULL,
        patient_email TEXT NOT NULL,
        patient_phone TEXT,
        appointment_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        payment_status TEXT NOT NULL DEFAULT 'pay_at_session',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
}
