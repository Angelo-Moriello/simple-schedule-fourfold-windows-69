
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RecurringTreatment } from '@/types/client';
import { Employee } from '@/types/appointment';
import { updateRecurringTreatmentInSupabase, loadEmployeesFromSupabase } from '@/utils/supabaseStorage';
import { getStoredServices } from '@/components/appointment-form/AppointmentFormLogic';

interface RecurringTreatmentEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: RecurringTreatment | null;
  onTreatmentUpdated: () => void;
}

const RecurringTreatmentEditDialog: React.FC<RecurringTreatmentEditDialogProps> = ({
  isOpen,
  onClose,
  treatment,
  onTreatmentUpdated
}) => {
  const [formData, setFormData] = useState<Partial<RecurringTreatment>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && treatment) {
      setFormData({
        ...treatment,
        start_date: treatment.start_date,
        end_date: treatment.end_date || undefined
      });
    }
  }, [isOpen, treatment]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const loadedEmployees = await loadEmployeesFromSupabase();
        setEmployees(loadedEmployees);
      } catch (error) {
        console.error('Errore nel caricamento dipendenti:', error);
      }
    };

    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!treatment || !formData.employee_id || !formData.service_type) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedTreatment: RecurringTreatment = {
        ...treatment,
        employee_id: formData.employee_id,
        service_type: formData.service_type,
        duration: formData.duration || 60,
        notes: formData.notes || '',
        frequency_type: formData.frequency_type || 'weekly',
        frequency_value: formData.frequency_value || 1,
        preferred_day_of_week: formData.preferred_day_of_week,
        preferred_day_of_month: formData.preferred_day_of_month,
        preferred_time: formData.preferred_time || '09:00',
        is_active: formData.is_active ?? true,
        start_date: formData.start_date || treatment.start_date,
        end_date: formData.end_date
      };

      await updateRecurringTreatmentInSupabase(updatedTreatment);
      toast.success('Trattamento ricorrente aggiornato con successo!');
      onTreatmentUpdated();
      onClose();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del trattamento:', error);
      toast.error('Errore nell\'aggiornare il trattamento ricorrente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceCategories = getStoredServices();
  const selectedEmployee = employees.find(emp => emp.id === formData.employee_id);
  const availableServices = selectedEmployee && serviceCategories[selectedEmployee.specialization] 
    ? serviceCategories[selectedEmployee.specialization]
    : [];

  if (!treatment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Trattamento Ricorrente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Dipendente *</Label>
            <Select
              value={formData.employee_id?.toString() || ''}
              onValueChange={(value) => setFormData({ ...formData, employee_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona dipendente" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name} - {employee.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Servizio *</Label>
            <Select
              value={formData.service_type || ''}
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona servizio" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map(service => (
                  <SelectItem key={service.name} value={service.name}>
                    {service.name} ({service.duration}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durata (minuti)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration || 60}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              min="15"
              step="15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_time">Orario preferito</Label>
            <Input
              id="preferred_time"
              type="time"
              value={formData.preferred_time || '09:00'}
              onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency_type">Frequenza</Label>
            <Select
              value={formData.frequency_type || 'weekly'}
              onValueChange={(value: 'weekly' | 'monthly') => setFormData({ ...formData, frequency_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringTreatmentEditDialog;
