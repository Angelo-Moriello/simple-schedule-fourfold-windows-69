-- Verifica e abilita realtime per le tabelle necessarie
-- Aggiungi le tabelle alla pubblicazione realtime
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;

-- Imposta REPLICA IDENTITY FULL per garantire dati completi nelle modifiche realtime
ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE employees REPLICA IDENTITY FULL;
ALTER TABLE clients REPLICA IDENTITY FULL;