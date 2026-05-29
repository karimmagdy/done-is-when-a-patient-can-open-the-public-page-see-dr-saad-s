'use client';
import type { SelectedSlot } from './BookingPage';

interface Props {
  booking: { name: string; email: string; slot: SelectedSlot };
}

export default function BookingConfirmation({ booking }: Props) {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="card">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl mx-auto mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking confirmed!</h2>
        <p className="text-gray-500 mb-6">Thank you, {booking.name}. A confirmation email has been sent to <strong>{booking.email}</strong>.</p>

        <div className="bg-primary/5 rounded-xl p-5 text-left border border-primary/15 mb-6">
          <h3 className="font-semibold text-primary mb-3">Appointment details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{booking.slot.displayDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="font-medium">{booking.slot.displayTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Therapist</span>
              <span className="font-medium">Dr. Saad El Mahdy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Session type</span>
              <span className="font-medium">In-person, 50 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pay at session</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">If you need to cancel or have any questions, please contact Dr. Saad directly.</p>
      </div>
    </div>
  );
}
