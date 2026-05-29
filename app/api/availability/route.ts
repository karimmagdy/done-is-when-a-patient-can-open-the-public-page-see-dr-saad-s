import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
const schema = 'user_312a098d';

export async function GET() {
  const admin = supabaseAdmin();
  const { data, error } = await admin.schema(schema as 'public').from('availability').select('*').order('day_of_week').order('start_time');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ availability: data });
}

export async function POST(req: NextRequest) {
  const admin = supabaseAdmin();
  const body = await req.json();
  const { day_of_week, start_time, end_time, session_duration_minutes } = body;
  if (day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const { data, error } = await admin.schema(schema as 'public').from('availability').insert({ day_of_week, start_time, end_time, session_duration_minutes: session_duration_minutes || 50 }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ availability: data });
}

export async function DELETE(req: NextRequest) {
  const admin = supabaseAdmin();
  const { id } = await req.json();
  const { error } = await admin.schema(schema as 'public').from('availability').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
