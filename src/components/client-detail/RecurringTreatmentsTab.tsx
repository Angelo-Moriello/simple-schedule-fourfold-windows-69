
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Repeat } from 'lucide-react';
import RecurringTreatmentForm from '../RecurringTreatmentForm';
import RecurringTreatmentsList from '../RecurringTreatmentsList';

interface RecurringTreatmentsTabProps {
  clientId: string;
  onTreatmentAdded: () => void;
}

const RecurringTreatmentsTab: React.FC<RecurringTreatmentsTabProps> = ({
  clientId,
  onTreatmentAdded
}) => {
  const [isRecurringFormOpen, setIsRecurringFormOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Trattamenti Ricorrenti
          </h3>
          <Button
            onClick={() => setIsRecurringFormOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Trattamento
          </Button>
        </div>

        <RecurringTreatmentsList clientId={clientId} />
      </div>

      <RecurringTreatmentForm
        isOpen={isRecurringFormOpen}
        onClose={() => setIsRecurringFormOpen(false)}
        clientId={clientId}
        onTreatmentAdded={() => {
          setIsRecurringFormOpen(false);
          onTreatmentAdded();
        }}
      />
    </>
  );
};

export default RecurringTreatmentsTab;
