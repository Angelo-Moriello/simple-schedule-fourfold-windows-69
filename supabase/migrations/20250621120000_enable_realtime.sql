
-- Abilita il replica identity per catturare tutti i cambiamenti
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.employees REPLICA IDENTITY FULL;

-- Aggiungi le tabelle alla pubblicazione realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
