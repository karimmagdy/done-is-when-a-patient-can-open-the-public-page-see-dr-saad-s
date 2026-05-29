'use client';
import { useState } from 'react';
import type { SelectedSlot } from './BookingPage';

interface Props {
  slot: SelectedSlot;
  onBack: () => void;
  onConfirmed: (name: string, email: string) => void;
}

export default function BookingForm({ slot, onBack, onConfirmed }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) { setError('Please fill in your name and email.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, notes, ...slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      onConfirmed(name, email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Selected slot summary */}
      <div className="card mb-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary/70 font-medium uppercase tracking-wide">Your appointment</p>
            <p className="text-lg font-semibold text-primary mt-1">{slot.displayDate}</p>
            <p className="text-primary/80">{slot.displayTime}</p>
          </div>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-primary underline">Change</button>
        </div>
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-1 font-medium">💳 Payment at session — no card required now</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">You'll pay directly at the session. Online payment coming soon.</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Your details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name <span className="text-red-400">*</span></label>
            <input className="input-field" placeholder="e.g. Ahmed Hassan" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address <span className="text-red-400">*</span></label>
            <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <p className="text-xs text-gray-400 mt-1">Confirmation will be sent here</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number <span className="text-gray-400">(optional)</span></label>
            <input type="tel" className="input-field" placeholder="+20 xxx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anything you'd like to share? <span className="text-gray-400">(optional)</span></label>
            <textarea className="input-field resize-none" rows={3} placeholder="Brief reason for visit or any notes for Dr. Saad…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onBack} className="btn-secondary flex-1">← Back</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
