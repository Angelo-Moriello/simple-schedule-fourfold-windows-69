
-- Prima rimuovi tutte le policy RLS esistenti
DROP POLICY IF EXISTS "Users can view their own services" ON custom_services;
DROP POLICY IF EXISTS "Users can insert their own services" ON custom_services;  
DROP POLICY IF EXISTS "Users can update their own services" ON custom_services;
DROP POLICY IF EXISTS "Users can delete their own services" ON custom_services;

-- Ora possiamo rimuovere la colonna user_id
ALTER TABLE custom_services DROP COLUMN user_id;

-- Aggiungi nuove policy per permettere accesso globale a tutti gli utenti autenticati
CREATE POLICY "Authenticated users can view services" ON custom_services
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert services" ON custom_services
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update services" ON custom_services  
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete services" ON custom_services
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Assicurati che ci sia solo un record nella tabella (servizi globali)
-- Prima elimina eventuali record duplicati mantenendo solo il più recente
DELETE FROM custom_services 
WHERE id NOT IN (
    SELECT id FROM custom_services 
    ORDER BY updated_at DESC 
    LIMIT 1
);
