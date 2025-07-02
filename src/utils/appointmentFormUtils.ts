
export const appointmentColors = [
  { label: 'Blu', value: '#3B82F6' },
  { label: 'Verde', value: '#10B981' },
  { label: 'Giallo', value: '#F59E0B' },
  { label: 'Rosso', value: '#EF4444' },
  { label: 'Viola', value: '#8B5CF6' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Arancione', value: '#F97316' },
  { label: 'Grigio', value: '#6B7280' }
];

export const generateTimeSlots = () => {
  const slots = [];
  for (let i = 8; i <= 19; i++) {
    slots.push(`${String(i).padStart(2, '0')}:00`);
    slots.push(`${String(i).padStart(2, '0')}:30`);
  }
  return slots;
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
