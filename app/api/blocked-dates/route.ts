import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
const schema = 'user_312a098d';

export async function GET() {
  const admin = supabaseAdmin();
  const { data, error } = await admin.schema(schema as 'public').from('blocked_dates').select('*').order('blocked_date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocked_dates: data });
}

export async function POST(req: NextRequest) {
  const admin = supabaseAdmin();
  const { blocked_date, reason } = await req.json();
  if (!blocked_date) return NextResponse.json({ error: 'blocked_date required' }, { status: 400 });
  const { data, error } = await admin.schema(schema as 'public').from('blocked_dates').upsert({ blocked_date, reason: reason || null }, { onConflict: 'blocked_date' }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocked_date: data });
}

export async function DELETE(req: NextRequest) {
  const admin = supabaseAdmin();
  const { id } = await req.json();
  const { error } = await admin.schema(schema as 'public').from('blocked_dates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
