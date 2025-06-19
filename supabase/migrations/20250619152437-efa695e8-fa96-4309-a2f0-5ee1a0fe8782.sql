
-- Crea la tabella per i dipendenti
CREATE TABLE public.employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  specialization TEXT NOT NULL CHECK (specialization IN ('Parrucchiere', 'Estetista')),
  vacations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crea la tabella per gli appuntamenti  
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id INTEGER NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  email TEXT,
  phone TEXT,
  color TEXT NOT NULL,
  service_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aggiungi indici per migliorare le performance
CREATE INDEX idx_appointments_employee_id ON public.appointments(employee_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_employee_date ON public.appointments(employee_id, date);

-- Abilita Row Level Security (per ora permissiva, poi potrai aggiungere autenticazione)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy permissive per ora (tutti possono fare tutto)
CREATE POLICY "Allow all operations on employees" ON public.employees
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on appointments" ON public.appointments  
  FOR ALL USING (true) WITH CHECK (true);
