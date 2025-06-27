
import { supabase } from '@/integrations/supabase/client';

// Generate a proper UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to find client by ID and get full client info
export const getClientInfo = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('name, email, phone')
      .eq('id', clientId)
      .maybeSingle();
    
    if (error) {
      console.error('Errore nel recupero info cliente:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Errore nel recupero info cliente:', error);
    return null;
  }
};

// Helper function to find client ID by name
export const findClientIdByName = async (clientName: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', clientName.trim())
      .maybeSingle();
    
    if (error) {
      console.error('Errore nella ricerca cliente:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Errore nella ricerca cliente:', error);
    return null;
  }
};
