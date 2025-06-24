
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringTreatment {
  id: string;
  client_id: string;
  employee_id: number;
  service_type: string;
  duration: number;
  notes?: string;
  frequency_type: 'weekly' | 'monthly';
  frequency_value: number;
  preferred_day_of_week?: number; // 0-6 (0=domenica)
  preferred_day_of_month?: number; // 1-31
  preferred_time?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}
