
-- Reset tutti gli appuntamenti
DELETE FROM public.appointments;

-- Reset tutte le ferie dai dipendenti
UPDATE public.employees SET vacations = '{}';
