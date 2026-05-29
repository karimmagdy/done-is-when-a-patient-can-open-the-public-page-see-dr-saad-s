'use client';
import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay, addMonths, subMonths, getDay } from 'date-fns';
import type { SelectedSlot } from './BookingPage';

interface Props {
  onSlotSelected: (slot: SelectedSlot) => void;
}

interface AvailableSlot {
  start_time: string;
  end_time: string;
}

interface DaySlots {
  [date: string]: AvailableSlot[];
}

export default function CalendarPicker({ onSlotSelected }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<DaySlots>({});
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchMonthSlots = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const yearMonth = format(month, 'yyyy-MM');
      const res = await fetch(`/api/slots?month=${yearMonth}`);
      const data = await res.json();
      setDaySlots(data.slots || {});
    } catch {
      setDaySlots({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMonthSlots(currentMonth); }, [currentMonth, fetchMonthSlots]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = getDay(startOfMonth(currentMonth));
  const today = startOfDay(new Date());

  const hasSlots = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return (daySlots[key] || []).length > 0;
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) return;
    const key = format(date, 'yyyy-MM-dd');
    if (!(daySlots[key] || []).length) return;
    setSelectedDate(key);
  };

  const handleSlotClick = (slot: AvailableSlot) => {
    if (!selectedDate) return;
    const dateObj = new Date(selectedDate + 'T00:00:00');
    onSlotSelected({
      date: selectedDate,
      start_time: slot.start_time,
      end_time: slot.end_time,
      displayDate: format(dateObj, 'EEEE, MMMM d, yyyy'),
      displayTime: `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`,
    });
  };

  const selectedSlots = selectedDate ? (daySlots[selectedDate] || []) : [];

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-6">
      {/* Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">‹</button>
          <h2 className="text-lg font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">›</button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Loading availability…</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd');
              const past = isBefore(day, today);
              const available = !past && hasSlots(day);
              const selected = selectedDate === key;
              const isCurrentDay = isToday(day);
              return (
                <button
                  key={key}
                  onClick={() => handleDateClick(day)}
                  disabled={!available}
                  className={`relative aspect-square rounded-xl text-sm font-medium transition-all ${
                    selected
                      ? 'bg-primary text-white shadow-md scale-105'
                      : available
                      ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer'
                      : past
                      ? 'text-gray-300 cursor-default'
                      : 'text-gray-400 cursor-default'
                  } ${isCurrentDay && !selected ? 'ring-2 ring-primary/40' : ''}`}
                >
                  {format(day, 'd')}
                  {available && !selected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary/20 inline-block" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Selected</span>
        </div>
      </div>

      {/* Time slots */}
      <div className="card">
        {!selectedDate ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium text-gray-500">Select a date</p>
            <p className="text-sm mt-1">Dates with available slots are highlighted</p>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-gray-800 mb-1">{format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} available</p>
            <div className="space-y-2">
              {selectedSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => handleSlotClick(slot)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary">{formatTime(slot.start_time)}</span>
                    <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">50 min →</span>
                  </div>
                </button>
              ))}
            </div>
          </>
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
