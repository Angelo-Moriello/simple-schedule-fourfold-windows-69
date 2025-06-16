
export interface Appointment {
  id: string;
  employeeId: number;
  date: string;
  time: string;
  title: string;
  client: string;
  duration: number; // in minutes
  notes?: string;
  email?: string;
  phone?: string;
  color: string; // colore per l'etichetta
}

export interface Employee {
  id: number;
  name: string;
  color: string;
}
