import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format, isBefore, startOfDay, addMinutes } from 'date-fns';

export const dynamic = 'force-dynamic';

function parseTime(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date(1970, 0, 1, h, m);
  return d;
}

function generateSlots(startStr: string, endStr: string, durationMin: number): { start_time: string; end_time: string }[] {
  const slots: { start_time: string; end_time: string }[] = [];
  let cur = parseTime(startStr);
  const end = parseTime(endStr);
  while (true) {
    const next = addMinutes(cur, durationMin);
    if (next > end) break;
    slots.push({
      start_time: format(cur, 'HH:mm'),
      end_time: format(next, 'HH:mm'),
    });
    cur = next;
  }
  return slots;
}

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month'); // YYYY-MM
  if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 });

  const admin = supabaseAdmin();
  const schema = 'user_312a098d';
  const today = startOfDay(new Date());

  try {
    const monthDate = new Date(month + '-01');
    const days = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) });

    // Fetch availability
    const { data: availability, error: avError } = await admin
      .schema(schema as 'public')
      .from('availability')
      .select('*');

    if (avError) return NextResponse.json({ slots: {} });

    // Fetch blocked dates
    const startStr = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const endStr = format(endOfMonth(monthDate), 'yyyy-MM-dd');
    const { data: blocked } = await admin
      .schema(schema as 'public')
      .from('blocked_dates')
      .select('blocked_date')
      .gte('blocked_date', startStr)
      .lte('blocked_date', endStr);

    // Fetch booked appointments
    const { data: booked } = await admin
      .schema(schema as 'public')
      .from('appointments')
      .select('appointment_date, start_time')
      .gte('appointment_date', startStr)
      .lte('appointment_date', endStr)
      .eq('status', 'confirmed');

    const blockedSet = new Set((blocked || []).map((b: { blocked_date: string }) => b.blocked_date));
    const bookedSet = new Set((booked || []).map((a: { appointment_date: string; start_time: string }) => `${a.appointment_date}_${a.start_time}`));

    const result: Record<string, { start_time: string; end_time: string }[]> = {};

    for (const day of days) {
      if (isBefore(day, today)) continue;
      const dateStr = format(day, 'yyyy-MM-dd');
      if (blockedSet.has(dateStr)) continue;
      const dow = getDay(day);
      const dayAvailability = (availability || []).filter((a: { day_of_week: number }) => a.day_of_week === dow);
      if (!dayAvailability.length) continue;

      const slots: { start_time: string; end_time: string }[] = [];
      for (const av of dayAvailability) {
        const generated = generateSlots(av.start_time, av.end_time, av.session_duration_minutes);
        for (const s of generated) {
          const key = `${dateStr}_${s.start_time}`;
          if (!bookedSet.has(key)) slots.push(s);
        }
      }
      if (slots.length) result[dateStr] = slots;
    }

    return NextResponse.json({ slots: result });
  } catch {
    return NextResponse.json({ slots: {} });
  }
}
