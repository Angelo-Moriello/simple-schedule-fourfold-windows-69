
-- Crea la tabella per i clienti
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crea la tabella per i trattamenti ricorrenti
CREATE TABLE public.recurring_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('weekly', 'monthly')),
  frequency_value INTEGER NOT NULL DEFAULT 1, -- ogni X settimane/mesi
  preferred_day_of_week INTEGER, -- 0-6 per settimanale (0=domenica)
  preferred_day_of_month INTEGER, -- 1-31 per mensile
  preferred_time TIME,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Aggiungi indici per migliorare le performance
CREATE INDEX idx_clients_name ON public.clients(name);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_phone ON public.clients(phone);
CREATE INDEX idx_recurring_treatments_client_id ON public.recurring_treatments(client_id);
CREATE INDEX idx_recurring_treatments_employee_id ON public.recurring_treatments(employee_id);
CREATE INDEX idx_recurring_treatments_active ON public.recurring_treatments(is_active);

-- Abilita Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_treatments ENABLE ROW LEVEL SECURITY;

-- Policy permissive per ora (tutti possono fare tutto)
CREATE POLICY "Allow all operations on clients" ON public.clients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on recurring_treatments" ON public.recurring_treatments
  FOR ALL USING (true) WITH CHECK (true);

-- Aggiorna la tabella appointments per collegare i clienti
ALTER TABLE public.appointments ADD COLUMN client_id UUID REFERENCES public.clients(id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
