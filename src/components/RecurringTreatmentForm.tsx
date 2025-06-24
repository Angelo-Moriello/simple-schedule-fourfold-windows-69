
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Repeat, User, Clock, Calendar } from 'lucide-react';
import { Employee, serviceCategories } from '@/types/appointment';
import { RecurringTreatment } from '@/types/client';
import { loadEmployeesFromSupabase } from '@/utils/supabaseStorage';
import { addRecurringTreatmentToSupabase } from '@/utils/clientStorage';

interface RecurringTreatmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onTreatmentAdded: () => void;
}

const RecurringTreatmentForm: React.FC<RecurringTreatmentFormProps> = ({
  isOpen,
  onClose,
  clientId,
  onTreatmentAdded
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    service_type: '',
    duration: 60,
    notes: '',
    frequency_type: 'weekly' as 'weekly' | 'monthly',
    frequency_value: 1,
    preferred_day_of_week: undefined as number | undefined,
    preferred_day_of_month: undefined as number | undefined,
    preferred_time: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const loadedEmployees = await loadEmployeesFromSupabase();
      setEmployees(loadedEmployees);
    } catch (error) {
      console.error('Errore nel caricamento dipendenti:', error);
      toast.error('Errore nel caricamento dei dipendenti');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.service_type) {
      toast.error('Dipendente e tipo di servizio sono obbligatori');
      return;
    }

    if (formData.frequency_type === 'weekly' && formData.preferred_day_of_week === undefined) {
      toast.error('Seleziona il giorno della settimana per il trattamento settimanale');
      return;
    }

    if (formData.frequency_type === 'monthly' && formData.preferred_day_of_month === undefined) {
      toast.error('Seleziona il giorno del mese per il trattamento mensile');
      return;
    }

    try {
      setIsSubmitting(true);
      await addRecurringTreatmentToSupabase({
        client_id: clientId,
        employee_id: parseInt(formData.employee_id),
        service_type: formData.service_type,
        duration: formData.duration,
        notes: formData.notes || undefined,
        frequency_type: formData.frequency_type,
        frequency_value: formData.frequency_value,
        preferred_day_of_week: formData.preferred_day_of_week,
        preferred_day_of_month: formData.preferred_day_of_month,
        preferred_time: formData.preferred_time || undefined,
        is_active: true,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined
      });
      
      resetForm();
      onTreatmentAdded();
    } catch (error) {
      console.error('Errore nell\'aggiunta del trattamento ricorrente:', error);
      toast.error('Errore nell\'aggiungere il trattamento ricorrente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      service_type: '',
      duration: 60,
      notes: '',
      frequency_type: 'weekly',
      frequency_value: 1,
      preferred_day_of_week: undefined,
      preferred_day_of_month: undefined,
      preferred_time: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employee_id));
  const availableServices = selectedEmployee 
    ? serviceCategories[selectedEmployee.specialization]?.services || []
    : [];

  const daysOfWeek = [
    { value: 1, label: 'Lunedì' },
    { value: 2, label: 'Martedì' },
    { value: 3, label: 'Mercoledì' },
    { value: 4, label: 'Giovedì' },
    { value: 5, label: 'Venerdì' },
    { value: 6, label: 'Sabato' },
    { value: 0, label: 'Domenica' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-purple-100 rounded-full p-2">
              <Repeat className="h-4 w-4 text-purple-600" />
            </div>
            Nuovo Trattamento Ricorrente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dipendente *
              </Label>
              <Select 
                value={formData.employee_id} 
                onValueChange={(value) => setFormData({ ...formData, employee_id: value, service_type: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona dipendente" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({employee.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo di Servizio *</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                disabled={!selectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona servizio" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(service => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Durata (minuti)
              </Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minuti</SelectItem>
                  <SelectItem value="45">45 minuti</SelectItem>
                  <SelectItem value="60">1 ora</SelectItem>
                  <SelectItem value="90">1.5 ore</SelectItem>
                  <SelectItem value="120">2 ore</SelectItem>
                  <SelectItem value="150">2.5 ore</SelectItem>
                  <SelectItem value="180">3 ore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Orario Preferito</Label>
              <Input
                type="time"
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Frequenza</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo di Frequenza</Label>
                <Select
                  value={formData.frequency_type}
                  onValueChange={(value: 'weekly' | 'monthly') => 
                    setFormData({ 
                      ...formData, 
                      frequency_type: value,
                      preferred_day_of_week: undefined,
                      preferred_day_of_month: undefined 
                    })
                  }
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
                <Label>Ogni</Label>
                <Select
                  value={formData.frequency_value.toString()}
                  onValueChange={(value) => setFormData({ ...formData, frequency_value: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 4 }, (_, i) => i + 1).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {formData.frequency_type === 'weekly' ? 
                          (num === 1 ? 'settimana' : 'settimane') : 
                          (num === 1 ? 'mese' : 'mesi')
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.frequency_type === 'weekly' && (
              <div className="space-y-2">
                <Label>Giorno della Settimana *</Label>
                <Select
                  value={formData.preferred_day_of_week?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, preferred_day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona giorno" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.frequency_type === 'monthly' && (
              <div className="space-y-2">
                <Label>Giorno del Mese *</Label>
                <Select
                  value={formData.preferred_day_of_month?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, preferred_day_of_month: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona giorno" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Inizio *
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fine (opzionale)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive sul trattamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Aggiunta...' : 'Aggiungi Trattamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringTreatmentForm;
