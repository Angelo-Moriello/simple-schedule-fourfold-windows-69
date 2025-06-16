
export interface Appointment {
  id: string;
  employeeId: number;
  date: string;
  time: string;
  title: string;
  client: string;
  duration: number; // in minutes
  notes?: string;
}

export interface Employee {
  id: number;
  name: string;
  color: string;
}
