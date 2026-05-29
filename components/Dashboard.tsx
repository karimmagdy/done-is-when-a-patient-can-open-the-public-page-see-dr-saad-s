'use client';
import { useState, useEffect, useCallback } from 'react';
import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isBefore, startOfDay, isSameMonth } from 'date-fns';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

interface AvailabilityRow { id: string; day_of_week: number; start_time: string; end_time: string; session_duration_minutes: number; }
interface BlockedDate { id: string; blocked_date: string; reason?: string; }
interface Appointment { id: string; patient_name: string; patient_email: string; patient_phone?: string; appointment_date: string; start_time: string; end_time: string; status: string; payment_status: string; notes?: string; created_at: string; }

const AUTH_KEY = 'ds_auth';
const PASSWORD = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'saad2024';

export default function Dashboard() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [tab, setTab] = useState<'bookings' | 'availability' | 'blocked'>('bookings');

  // Auth
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(AUTH_KEY) === '1') setAuthed(true);
  }, []);

  const login = () => {
    if (pw === PASSWORD) { localStorage.setItem(AUTH_KEY, '1'); setAuthed(true); }
    else setPwError('Incorrect password');
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center px-4">
        <div className="card w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">S</div>
            <h1 className="text-xl font-bold text-primary">Dr. Saad\'s Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your password to continue</p>
          </div>
          <input type="password" className="input-field mb-3" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          {pwError && <p className="text-red-500 text-sm mb-3">{pwError}</p>}
          <button onClick={login} className="btn-primary w-full">Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">S</div>
            <div>
              <h1 className="font-bold text-primary">Dr. Saad El Mahdy</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <div className="flex gap-1">
            {(['bookings','availability','blocked'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}>{t === 'blocked' ? 'Block dates' : t === 'availability' ? 'Availability' : 'Bookings'}</button>
            ))}
          </div>
          <button onClick={() => { localStorage.removeItem(AUTH_KEY); setAuthed(false); }} className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'availability' && <AvailabilityTab />}
        {tab === 'blocked' && <BlockedDatesTab />}
      </main>
    </div>
  );
}

function BookingsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id: string) => {
    await fetch('/api/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'cancelled' }) });
    load();
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading bookings…</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming bookings ({appointments.filter(a => a.status === 'confirmed').length})</h2>
      {appointments.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p>No upcoming bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className={`card flex items-start justify-between gap-4 ${ apt.status === 'cancelled' ? 'opacity-50' : '' }`}>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 rounded-xl px-3 py-2 text-center min-w-[64px]">
                  <div className="text-xs text-primary/60 font-medium">{format(new Date(apt.appointment_date + 'T00:00'), 'MMM').toUpperCase()}</div>
                  <div className="text-2xl font-bold text-primary">{format(new Date(apt.appointment_date + 'T00:00'), 'd')}</div>
                  <div className="text-xs text-primary/60">{format(new Date(apt.appointment_date + 'T00:00'), 'EEE')}</div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{apt.patient_name}</p>
                  <p className="text-sm text-gray-500">{apt.patient_email}{apt.patient_phone ? ` · ${apt.patient_phone}` : ''}</p>
                  <p className="text-sm font-medium text-primary mt-1">{formatTime(apt.start_time)} – {formatTime(apt.end_time)}</p>
                  {apt.notes && <p className="text-xs text-gray-400 mt-1 italic">“{apt.notes}”</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>{apt.status}</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">Pay at session</span>
                {apt.status === 'confirmed' && (
                  <button onClick={() => cancel(apt.id)} className="text-xs text-red-400 hover:text-red-600 mt-1">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvailabilityTab() {
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ day_of_week: 1, start_time: '09:00', end_time: '17:00', session_duration_minutes: 50 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/availability');
    const data = await res.json();
    setRows(data.availability || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    await fetch('/api/availability', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Weekly availability</h2>
      <p className="text-sm text-gray-500 mb-6">Set recurring hours for each day of the week. Time slots are auto-generated.</p>

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Add availability</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Day</label>
            <select className="input-field" value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: +e.target.value }))}>
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Duration (min)</label>
            <select className="input-field" value={form.session_duration_minutes} onChange={e => setForm(f => ({ ...f, session_duration_minutes: +e.target.value }))}>
              {[30, 45, 50, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start time</label>
            <input type="time" className="input-field" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End time</label>
            <input type="time" className="input-field" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={add} disabled={saving} className="btn-primary">+ Add hours</button>
      </div>

      {loading ? <div className="text-gray-400 text-sm">Loading…</div> : (
        <div className="space-y-2">
          {rows.length === 0 && <p className="text-gray-400 text-sm">No availability set yet.</p>}
          {rows.map(row => (
            <div key={row.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
              <div>
                <span className="font-medium text-primary">{DAY_NAMES[row.day_of_week]}</span>
                <span className="text-gray-500 text-sm ml-3">{formatTime(row.start_time)} – {formatTime(row.end_time)}</span>
                <span className="text-gray-400 text-xs ml-2">({row.session_duration_minutes} min slots)</span>
              </div>
              <button onClick={() => remove(row.id)} className="text-sm text-red-400 hover:text-red-600">× Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockedDatesTab() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/blocked-dates');
    const data = await res.json();
    setBlockedDates(data.blocked_dates || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const blockedSet = new Set(blockedDates.map(b => b.blocked_date));

  const toggleDate = async (dateStr: string) => {
    if (isBefore(new Date(dateStr + 'T00:00'), startOfDay(new Date()))) return;
    setSaving(true);
    if (blockedSet.has(dateStr)) {
      const bd = blockedDates.find(b => b.blocked_date === dateStr);
      if (bd) {
        await fetch('/api/blocked-dates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bd.id }) });
      }
    } else {
      await fetch('/api/blocked-dates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blocked_date: dateStr, reason: reason || null }) });
    }
    setSaving(false);
    load();
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = getDay(startOfMonth(currentMonth));
  const today = startOfDay(new Date());

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Block dates</h2>
      <p className="text-sm text-gray-500 mb-6">Click any date to block it (patients won\'t see it as available). Click again to unblock.</p>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">‹</button>
          <h3 className="font-semibold text-gray-700">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">›</button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {DAY_SHORT.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
        </div>
        {loading ? <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Loading…</div> : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const past = isBefore(day, today);
              const blocked = blockedSet.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleDate(key)}
                  disabled={past || saving}
                  className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                    blocked ? 'bg-red-100 text-red-600 border-2 border-red-300' :
                    past ? 'text-gray-300 cursor-default' :
                    'hover:bg-primary/10 text-gray-700 hover:text-primary'
                  }`}
                >{format(day, 'd')}</button>
              );
            })}
          </div>
        )}
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" /> Blocked</span>
          <span className="text-gray-400">Click to toggle</span>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">Blocked dates ({blockedDates.length})</h3>
        {blockedDates.length === 0 ? <p className="text-gray-400 text-sm">No dates blocked.</p> : (
          <div className="space-y-2">
            {blockedDates.sort((a,b) => a.blocked_date.localeCompare(b.blocked_date)).map(bd => (
              <div key={bd.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{format(new Date(bd.blocked_date + 'T00:00'), 'EEEE, MMMM d, yyyy')}</span>
                <button onClick={() => fetch('/api/blocked-dates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bd.id }) }).then(() => load())} className="text-red-400 hover:text-red-600 text-xs">× Unblock</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
