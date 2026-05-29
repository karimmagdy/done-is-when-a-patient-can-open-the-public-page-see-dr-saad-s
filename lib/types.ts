export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  session_duration_minutes: number;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'payment_pending';
  payment_status: 'paid' | 'pay_at_session' | 'pending';
  notes?: string;
  created_at: string;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
