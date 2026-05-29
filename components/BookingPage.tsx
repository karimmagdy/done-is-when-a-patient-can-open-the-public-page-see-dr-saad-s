'use client';
import { useState } from 'react';
import CalendarPicker from './CalendarPicker';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';

export type BookingStep = 'calendar' | 'form' | 'confirmed';

export interface SelectedSlot {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;
  displayDate: string;
  displayTime: string;
}

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>('calendar');
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{ name: string; email: string; slot: SelectedSlot } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/10">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">S</div>
          <div>
            <h1 className="text-xl font-bold text-primary">Dr. Saad El Mahdy</h1>
            <p className="text-sm text-gray-500">Psychiatrist & Psychotherapist, MD</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Progress */}
        {step !== 'confirmed' && (
          <div className="flex items-center gap-3 mb-8">
            {['Pick a slot', 'Your details', 'Confirmed'].map((label, i) => {
              const isActive = (step === 'calendar' && i === 0) || (step === 'form' && i === 1);
              // This block only renders while step !== 'confirmed', so step is
              // narrowed to 'calendar' | 'form' here — a step === 'confirmed'
              // check is dead code and a TS "no overlap" error. On the form
              // step, the first indicator ("Pick a slot") is the done one.
              const isDone = step === 'form' && i === 0;
              return (
                <>
                  <div key={label} className={`flex items-center gap-2 text-sm font-medium ${
                    isActive ? 'text-primary' : isDone ? 'text-primary/60' : 'text-gray-400'
                  }`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isDone ? 'bg-primary text-white' : isActive ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-400'
                    }`}>{isDone ? '✓' : i + 1}</span>
                    {label}
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
                </>
              );
            })}
          </div>
        )}

        {step === 'calendar' && (
          <CalendarPicker
            onSlotSelected={(slot) => { setSelectedSlot(slot); setStep('form'); }}
          />
        )}

        {step === 'form' && selectedSlot && (
          <BookingForm
            slot={selectedSlot}
            onBack={() => setStep('calendar')}
            onConfirmed={(name, email) => {
              setConfirmedBooking({ name, email, slot: selectedSlot });
              setStep('confirmed');
            }}
          />
        )}

        {step === 'confirmed' && confirmedBooking && (
          <BookingConfirmation booking={confirmedBooking} />
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8">
        © {new Date().getFullYear()} Dr. Saad El Mahdy — All sessions are in-person
      </footer>
    </div>
  );
}
