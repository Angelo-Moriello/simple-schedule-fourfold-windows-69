import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Repeat, User, Clock, Calendar, 
  Edit, Trash2, Play, Pause 
} from 'lucide-react';
import { RecurringTreatment } from '@/types/client';
import { Employee } from '@/types/appointment';
import { 
  loadRecurringTreatmentsFromSupabase,
  updateRecurringTreatmentInSupabase,
  deleteRecurringTreatmentFromSupabase
} from '@/utils/clientStorage';
import { loadEmployeesFromSupabase } from '@/utils/supabaseStorage';
import { generateAppointmentsForDateRange } from '@/utils/recurringTreatmentUtils';
import { addDays } from 'date-fns';

interface RecurringTreatmentsListProps {
  clientId: string;
}

const RecurringTreatmentsList: React.FC<RecurringTreatmentsListProps> = ({ clientId }) => {
  const [treatments, setTreatments] = useState<RecurringTreatment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedTreatments, loadedEmployees] = await Promise.all([
        loadRecurringTreatmentsFromSupabase(clientId),
        loadEmployeesFromSupabase()
      ]);
      setTreatments(loadedTreatments);
      setEmployees(loadedEmployees);
    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
      toast.error('Errore nel caricamento dei trattamenti');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTreatmentStatus = async (treatment: RecurringTreatment) => {
    try {
      await updateRecurringTreatmentInSupabase({
        ...treatment,
        is_active: !treatment.is_active
      });
      
      // Se il trattamento viene attivato, genera appuntamenti futuri
      if (!treatment.is_active) {
        const startDate = new Date();
        const endDate = addDays(new Date(), 90); // 3 mesi in avanti
        await generateAppointmentsForDateRange([{...treatment, is_active: true}], startDate, endDate);
      }
      
      await loadData();
      toast.success(
        treatment.is_active 
          ? 'Trattamento disattivato' 
          : 'Trattamento attivato e appuntamenti generati'
      );
    } catch (error) {
      console.error('Errore nell\'aggiornamento del trattamento:', error);
      toast.error('Errore nell\'aggiornare il trattamento');
    }
  };

  const deleteTreatment = async (treatmentId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo trattamento ricorrente?')) {
      return;
    }

    try {
      await deleteRecurringTreatmentFromSupabase(treatmentId);
      await loadData();
      toast.success('Trattamento eliminato con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione del trattamento:', error);
      toast.error('Errore nell\'eliminare il trattamento');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Dipendente non trovato';
  };

  const formatFrequency = (treatment: RecurringTreatment) => {
    const { frequency_type, frequency_value } = treatment;
    const unit = frequency_type === 'weekly' ? 'settimana' : 'mese';
    const unitPlural = frequency_type === 'weekly' ? 'settimane' : 'mesi';
    
    if (frequency_value === 1) {
      return `Ogni ${unit}`;
    }
    return `Ogni ${frequency_value} ${unitPlural}`;
  };

  const formatPreferredDay = (treatment: RecurringTreatment) => {
    if (treatment.frequency_type === 'weekly' && treatment.preferred_day_of_week !== undefined) {
      const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
      return days[treatment.preferred_day_of_week];
    }
    
    if (treatment.frequency_type === 'monthly' && treatment.preferred_day_of_month !== undefined) {
      return `Giorno ${treatment.preferred_day_of_month} del mese`;
    }
    
    return 'Non specificato';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento trattamenti...</p>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8">
        <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessun trattamento ricorrente configurato</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {treatments.map((treatment) => (
        <Card key={treatment.id} className={treatment.is_active ? '' : 'opacity-60'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${treatment.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                {treatment.service_type}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => toggleTreatmentStatus(treatment)}
                  variant="outline"
                  size="sm"
                  className={treatment.is_active ? 'text-orange-600' : 'text-green-600'}
                >
                  {treatment.is_active ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Disattiva
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Attiva
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => deleteTreatment(treatment.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Dipendente:</span>
                  <span>{getEmployeeName(treatment.employee_id)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Durata:</span>
                  <span>{treatment.duration} minuti</span>
                </div>
                
                {treatment.preferred_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Orario:</span>
                    <span>{treatment.preferred_time.slice(0, 5)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Frequenza:</span>
                  <span>{formatFrequency(treatment)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Giorno:</span>
                  <span>{formatPreferredDay(treatment)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Periodo:</span>
                  <span>
                    {formatDate(treatment.start_date)}
                    {treatment.end_date && ` - ${formatDate(treatment.end_date)}`}
                  </span>
                </div>
              </div>
            </div>
            
            {treatment.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> {treatment.notes}
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Badge variant={treatment.is_active ? "default" : "secondary"}>
                {treatment.is_active ? 'Attivo' : 'Disattivato'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecurringTreatmentsList;
