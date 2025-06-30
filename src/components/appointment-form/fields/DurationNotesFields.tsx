
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, FileText } from 'lucide-react';

interface DurationNotesFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DurationNotesFields: React.FC<DurationNotesFieldsProps> = ({
  formData,
  setFormData
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock className="h-4 w-4" />
          Durata (minuti) <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.duration}
          onValueChange={(value) => setFormData({ ...formData, duration: value })}
        >
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            <SelectItem value="15">15 minuti</SelectItem>
            <SelectItem value="30">30 minuti</SelectItem>
            <SelectItem value="45">45 minuti</SelectItem>
            <SelectItem value="60">1 ora</SelectItem>
            <SelectItem value="90">1.5 ore</SelectItem>
            <SelectItem value="120">2 ore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="h-4 w-4" />
          Note (opzionale)
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Note aggiuntive..."
          rows={3}
          className="rounded-xl border-gray-200 focus:border-blue-500 transition-colors resize-none"
        />
      </div>
    </>
  );
};

export default DurationNotesFields;
