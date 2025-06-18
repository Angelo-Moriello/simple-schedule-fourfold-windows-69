
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
  serviceType: string;
}

export interface Employee {
  id: number;
  name: string;
  color: string;
  vacations?: string[]; // array of dates in 'yyyy-MM-dd' format
  specialization: 'Parrucchiere' | 'Estetista';
}

export interface ServiceCategory {
  name: string;
  services: string[];
}

export const serviceCategories: Record<'Parrucchiere' | 'Estetista', ServiceCategory> = {
  Parrucchiere: {
    name: 'Parrucchiere',
    services: ['Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli']
  },
  Estetista: {
    name: 'Estetista',
    services: ['Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo']
  }
};
