
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { Employee } from '@/types/appointment';
import EmployeeTimeFields from './fields/EmployeeTimeFields';
import ServiceTitleFields from './fields/ServiceTitleFields';
import DurationNotesFields from './fields/DurationNotesFields';

interface MultipleEvent {
  id: string;
  employeeId: string;
  time: string;
  serviceType: string;
  title: string;
  duration: string;
  notes: string;
}

interface MultipleEventsManagerProps {
  events: MultipleEvent[];
  onEventsChange: (events: MultipleEvent[]) => void;
  employees: Employee[];
  timeSlots: string[];
  availableServices: string[];
  selectedEmployee: Employee | undefined;
  mainEmployeeId: string;
  mainTime: string;
}

const MultipleEventsManager: React.FC<MultipleEventsManagerProps> = ({
  events,
  onEventsChange,
  employees,
  timeSlots,
  availableServices,
  selectedEmployee,
  mainEmployeeId,
  mainTime
}) => {
  const addEvent = () => {
    const newEvent: MultipleEvent = {
      id: Date.now().toString(),
      employeeId: mainEmployeeId,
      time: '',
      serviceType: '',
      title: '',
      duration: '30',
      notes: ''
    };
    onEventsChange([...events, newEvent]);
  };

  const removeEvent = (eventId: string) => {
    onEventsChange(events.filter(event => event.id !== eventId));
  };

  const updateEvent = (eventId: string, field: string, value: string) => {
    onEventsChange(events.map(event => 
      event.id === eventId ? { ...event, [field]: value } : event
    ));
  };

  const isTimeConflict = (eventTime: string, eventDuration: string, excludeId: string) => {
    const eventStart = new Date(`2000-01-01T${eventTime}:00`);
    const eventEnd = new Date(eventStart.getTime() + parseInt(eventDuration) * 60000);
    
    // Check against main appointment
    if (mainTime && eventTime) {
      const mainStart = new Date(`2000-01-01T${mainTime}:00`);
      const mainEnd = new Date(mainStart.getTime() + 30 * 60000); // assuming 30 min default
      
      if ((eventStart < mainEnd && eventEnd > mainStart)) {
        return true;
      }
    }
    
    // Check against other events
    return events.some(event => {
      if (event.id === excludeId || !event.time) return false;
      
      const otherStart = new Date(`2000-01-01T${event.time}:00`);
      const otherEnd = new Date(otherStart.getTime() + parseInt(event.duration) * 60000);
      
      return (eventStart < otherEnd && eventEnd > otherStart);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Eventi Aggiuntivi</h3>
        <Button
          type="button"
          onClick={addEvent}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Aggiungi Evento
        </Button>
      </div>

      {events.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Nessun evento aggiuntivo. Clicca "Aggiungi Evento" per aggiungere più servizi per questo cliente.
        </p>
      )}

      {events.map((event, index) => {
        const eventEmployee = employees.find(emp => emp.id === parseInt(event.employeeId));
        const eventAvailableServices = eventEmployee && availableServices.length > 0 ? availableServices : [];
        const hasTimeConflict = event.time && isTimeConflict(event.time, event.duration, event.id);

        return (
          <Card key={event.id} className={`border-l-4 ${hasTimeConflict ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-700">Evento {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {hasTimeConflict && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-sm text-red-800">
                    ⚠️ Conflitto di orario: questo evento si sovrappone con un altro appuntamento
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EmployeeTimeFields
                  formData={event}
                  setFormData={(data) => {
                    Object.keys(data).forEach(key => {
                      if (data[key] !== event[key]) {
                        updateEvent(event.id, key, data[key]);
                      }
                    });
                  }}
                  employees={employees}
                  timeSlots={timeSlots}
                />

                <div className="space-y-4">
                  <ServiceTitleFields
                    formData={event}
                    setFormData={(data) => {
                      Object.keys(data).forEach(key => {
                        if (data[key] !== event[key]) {
                          updateEvent(event.id, key, data[key]);
                        }
                      });
                    }}
                    availableServices={eventAvailableServices}
                    selectedEmployee={eventEmployee}
                  />

                  <DurationNotesFields
                    formData={event}
                    setFormData={(data) => {
                      Object.keys(data).forEach(key => {
                        if (data[key] !== event[key]) {
                          updateEvent(event.id, key, data[key]);
                        }
                      });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MultipleEventsManager;
