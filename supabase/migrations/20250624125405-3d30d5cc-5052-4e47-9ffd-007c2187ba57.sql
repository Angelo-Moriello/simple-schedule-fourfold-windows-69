
-- Aggiungi la colonna client_id alla tabella appointments se non esiste già
-- e aggiorna gli appuntamenti esistenti per collegare i clienti
DO $$
BEGIN
    -- Verifica se la colonna client_id esiste già
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'client_id'
    ) THEN
        -- Aggiungi la colonna client_id
        ALTER TABLE public.appointments 
        ADD COLUMN client_id UUID REFERENCES public.clients(id);
    END IF;
END $$;

-- Aggiorna gli appuntamenti esistenti per collegare i clienti basandosi sul nome
UPDATE public.appointments 
SET client_id = (
    SELECT c.id 
    FROM public.clients c 
    WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(appointments.client))
    LIMIT 1
)
WHERE client_id IS NULL AND client IS NOT NULL;

-- Crea un indice per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
