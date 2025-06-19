
-- Elimina tutti gli appuntamenti esistenti
DELETE FROM public.appointments;

-- Reset della sequenza per gli ID degli appuntamenti se necessario
-- (non applicabile per UUID, ma per sicurezza)
