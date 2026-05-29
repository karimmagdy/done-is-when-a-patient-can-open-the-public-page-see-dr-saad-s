import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
const schema = 'user_312a098d';

export async function GET() {
  const admin = supabaseAdmin();
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await admin
    .schema(schema as 'public')
    .from('appointments')
    .select('*')
    .gte('appointment_date', today)
    .order('appointment_date')
    .order('start_time');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointments: data });
}

export async function PATCH(req: NextRequest) {
  const admin = supabaseAdmin();
  const { id, status } = await req.json();
  const { data, error } = await admin
    .schema(schema as 'public')
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointment: data });
}
