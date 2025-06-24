
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/appointment';

export const saveEmployeesToSupabase = async (employees: Employee[]) => {
  try {
    console.log('Salvataggio dipendenti su Supabase:', employees);
    
    const { error: deleteError } = await supabase.from('employees').delete().neq('id', 0);
    if (deleteError) {
      console.error('Errore nella cancellazione dipendenti esistenti:', deleteError);
      throw deleteError;
    }
    
    if (employees.length > 0) {
      const { error: insertError } = await supabase.from('employees').insert(
        employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          color: emp.color,
          specialization: emp.specialization,
          vacations: emp.vacations || []
        }))
      );
      if (insertError) {
        console.error('Errore nell\'inserimento dipendenti:', insertError);
        throw insertError;
      }
    }
    console.log('Dipendenti salvati con successo');
  } catch (error) {
    console.error('Errore nel salvare i dipendenti su Supabase:', error);
    throw error;
  }
};

export const loadEmployeesFromSupabase = async (): Promise<Employee[]> => {
  try {
    console.log('Caricamento dipendenti da Supabase...');
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Errore nel caricamento dipendenti:', error);
      throw error;
    }
    
    const employees = data?.map(emp => ({
      id: emp.id,
      name: emp.name,
      color: emp.color,
      specialization: emp.specialization as 'Parrucchiere' | 'Estetista',
      vacations: emp.vacations || []
    })) || [];
    
    console.log('Dipendenti caricati:', employees);
    return employees;
  } catch (error) {
    console.error('Errore nel caricare i dipendenti da Supabase:', error);
    return [];
  }
};

export const addEmployeeToSupabase = async (employee: Employee) => {
  try {
    console.log('Aggiunta dipendente a Supabase:', employee);
    const { error } = await supabase.from('employees').insert({
      id: employee.id,
      name: employee.name,
      color: employee.color,
      specialization: employee.specialization,
      vacations: employee.vacations || []
    });
    if (error) {
      console.error('Errore SQL nell\'aggiunta dipendente:', error);
      throw error;
    }
    console.log('Dipendente aggiunto con successo');
  } catch (error) {
    console.error('Errore nell\'aggiungere dipendente su Supabase:', error);
    throw error;
  }
};

export const updateEmployeeInSupabase = async (employee: Employee) => {
  try {
    console.log('Aggiornamento dipendente su Supabase:', employee);
    const { error } = await supabase
      .from('employees')
      .update({
        name: employee.name,
        color: employee.color,
        specialization: employee.specialization,
        vacations: employee.vacations || []
      })
      .eq('id', employee.id);
    if (error) {
      console.error('Errore SQL nell\'aggiornamento dipendente:', error);
      throw error;
    }
    console.log('Dipendente aggiornato con successo');
  } catch (error) {
    console.error('Errore nell\'aggiornare dipendente su Supabase:', error);
    throw error;
  }
};

export const deleteEmployeeFromSupabase = async (employeeId: number) => {
  try {
    console.log('Eliminazione dipendente da Supabase:', employeeId);
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);
    if (error) {
      console.error('Errore SQL nell\'eliminazione dipendente:', error);
      throw error;
    }
    console.log('Dipendente eliminato con successo');
  } catch (error) {
    console.error('Errore nell\'eliminare dipendente da Supabase:', error);
    throw error;
  }
};
