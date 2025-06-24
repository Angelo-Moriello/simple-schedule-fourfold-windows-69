
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Edit, Trash2, Play, Pause, 
  RotateCcw, User 
} from 'lucide-react';
import { RecurringTreatment } from '@/types/client';
import { Employee } from '@/types/appointment';
import { 
  loadRecurringTreatmentsFromSupabase,
  deleteRecurringTreatmentFromSupabase,
  updateRecurringTreatmentInSupabase
} from '@/utils/clientStorage';
import { loadEmployeesFromSupabase } from '@/utils/supabaseStorage';
import RecurringTreatmentEditDialog from './RecurringTreatmentEditDialog';

interface RecurringTreatmentsListProps {
  clientId: string;
}

const RecurringTreatmentsList: React.FC<RecurringTreatmentsListProps> = ({
  clientId
}) => {
  const [treatments, setTreatments] = useState<RecurringTreatment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTreatment, setEditingTreatment] = useState<RecurringTreatment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      console.error('Errore nel caricamento dei trattamenti:', error);
      toast.error('Errore nel caricamento dei trattamenti ricorrenti');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (treatment: RecurringTreatment) => {
    setEditingTreatment(treatment);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (treatmentId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo trattamento ricorrente?')) {
      return;
    }

    try {
      await deleteRecurringTreatmentFromSupabase(treatmentId);
      await loadData();
      toast.success('Trattamento ricorrente eliminato con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione del trattamento:', error);
      toast.error('Errore nell\'eliminare il trattamento ricorrente');
    }
  };

  const handleToggleActive = async (treatment: RecurringTreatment) => {
    try {
      await updateRecurringTreatmentInSupabase({
        ...treatment,
        is_active: !treatment.is_active
      });
      await loadData();
      toast.success(`Trattamento ${treatment.is_active ? 'disattivato' : 'attivato'} con successo`);
    } catch (error) {
      console.error('Errore nell\'aggiornamento del trattamento:', error);
      toast.error('Errore nell\'aggiornare il trattamento');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Dipendente non trovato';
  };

  const formatFrequency = (treatment: RecurringTreatment) => {
    const base = treatment.frequency_type === 'weekly' ? 'settiman' : 'mensil';
    const suffix = treatment.frequency_value === 1 ? (base + 'e') : (base + 'i');
    const value = treatment.frequency_value === 1 ? '' : `ogni ${treatment.frequency_value} `;
    return `${value}${suffix}`;
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento trattamenti...</p>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8">
        <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nessun trattamento ricorrente trovato</p>
        <p className="text-sm text-gray-500 mt-2">
          Aggiungi un nuovo trattamento ricorrente per iniziare
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {treatments.map((treatment) => (
          <Card key={treatment.id} className={`${treatment.is_active ? 'bg-white' : 'bg-gray-50'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${treatment.is_active ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  {treatment.service_type}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(treatment)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(treatment)}
                    variant="outline"
                    size="sm"
                    className={`h-8 px-2 ${treatment.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                  >
                    {treatment.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    onClick={() => handleDelete(treatment.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{getEmployeeName(treatment.employee_id)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{treatment.duration} minuti</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-gray-500" />
                  <span>{formatFrequency(treatment)}</span>
                </div>
                
                {treatment.preferred_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Ore {formatTime(treatment.preferred_time)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Dal {formatDate(treatment.start_date)}</span>
                </div>
                
                {treatment.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Al {formatDate(treatment.end_date)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={treatment.is_active ? 'default' : 'secondary'}>
                  {treatment.is_active ? 'Attivo' : 'Inattivo'}
                </Badge>
                <Badge variant="outline">
                  {formatFrequency(treatment)}
                </Badge>
              </div>
              
              {treatment.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>Note:</strong> {treatment.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <RecurringTreatmentEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTreatment(null);
        }}
        treatment={editingTreatment}
        onTreatmentUpdated={() => {
          setIsEditDialogOpen(false);
          setEditingTreatment(null);
          loadData();
          toast.success('Trattamento ricorrente aggiornato con successo!');
        }}
      />
    </>
  );
};

export default RecurringTreatmentsList;
