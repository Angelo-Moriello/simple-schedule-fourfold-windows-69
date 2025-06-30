
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock className="h-4 w-4 text-green-600" />
          Durata <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.duration}
          onValueChange={(value) => setFormData({ ...formData, duration: value })}
        >
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 rounded-xl">
            <SelectItem value="15" className="cursor-pointer hover:bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                15 minuti
              </div>
            </SelectItem>
            <SelectItem value="30" className="cursor-pointer hover:bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                30 minuti
              </div>
            </SelectItem>
            <SelectItem value="45" className="cursor-pointer hover:bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                45 minuti
              </div>
            </SelectItem>
            <SelectItem value="60" className="cursor-pointer hover:bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                1 ora
              </div>
            </SelectItem>
            <SelectItem value="90" className="cursor-pointer hover:bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                1.5 ore
              </div>
            </SelectItem>
            <SelectItem value="120" className="cursor-pointer hover:bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-green-400" />
                2 ore
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="h-4 w-4 text-green-600" />
          Note <span className="text-gray-400 text-xs">(opzionale)</span>
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Note aggiuntive..."
          rows={3}
          className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none bg-white shadow-sm"
        />
      </div>
    </div>
  );
};

export default DurationNotesFields;
