
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { RecurringTreatment } from '@/types/client';
import { loadRecurringTreatmentsFromSupabase } from '@/utils/clientStorage';
import RecurringTreatmentEditDialog from '../RecurringTreatmentEditDialog';

interface RecurringTreatmentHandlerProps {
  appointment?: Appointment;
  occupiedBy?: Appointment;
  onRecurringEdit?: () => void;
}

const RecurringTreatmentHandler: React.FC<RecurringTreatmentHandlerProps> = ({
  appointment,
  occupiedBy,
  onRecurringEdit
}) => {
  const [recurringTreatment, setRecurringTreatment] = useState<RecurringTreatment | null>(null);
  const [isRecurringEditOpen, setIsRecurringEditOpen] = useState(false);

  const handleRecurringEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const targetAppointment = appointment || occupiedBy;
    if (!targetAppointment || !targetAppointment.clientId) return;

    try {
      const treatments = await loadRecurringTreatmentsFromSupabase(targetAppointment.clientId);
      const matchingTreatment = treatments.find(t => 
        t.employee_id === targetAppointment.employeeId &&
        t.service_type === targetAppointment.serviceType &&
        t.is_active
      );

      if (matchingTreatment) {
        setRecurringTreatment(matchingTreatment);
        setIsRecurringEditOpen(true);
      } else {
        console.log('Nessun trattamento ricorrente trovato per questo appuntamento');
      }
    } catch (error) {
      console.error('Errore nel caricamento trattamenti ricorrenti:', error);
    }
  };

  const handleTreatmentUpdated = () => {
    setIsRecurringEditOpen(false);
    if (onRecurringEdit) {
      onRecurringEdit();
    }
  };

  const isRecurringAppointment = (apt: Appointment) => {
    return apt.title?.includes('(Ricorrente)') || apt.color === '#22c55e';
  };

  const targetAppointment = appointment || occupiedBy;
  const showRecurringButton = targetAppointment && isRecurringAppointment(targetAppointment);

  if (!showRecurringButton) return null;

  return (
    <>
      <Button
        onClick={handleRecurringEdit}
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
      >
        <Settings className="h-3 w-3" />
      </Button>

      <RecurringTreatmentEditDialog
        isOpen={isRecurringEditOpen}
        onClose={() => setIsRecurringEditOpen(false)}
        treatment={recurringTreatment}
        onTreatmentUpdated={handleTreatmentUpdated}
      />
    </>
  );
};

export default RecurringTreatmentHandler;
