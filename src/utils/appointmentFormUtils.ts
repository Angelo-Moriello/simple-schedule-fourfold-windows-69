
export const appointmentColors = [
  { label: 'Blu', value: 'bg-blue-100 border-blue-300 text-blue-800' },
  { label: 'Verde', value: 'bg-green-100 border-green-300 text-green-800' },
  { label: 'Giallo', value: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { label: 'Rosso', value: 'bg-red-100 border-red-300 text-red-800' },
  { label: 'Viola', value: 'bg-purple-100 border-purple-300 text-purple-800' },
  { label: 'Rosa', value: 'bg-pink-100 border-pink-300 text-pink-800' },
  { label: 'Arancione', value: 'bg-orange-100 border-orange-300 text-orange-800' },
  { label: 'Grigio', value: 'bg-gray-100 border-gray-300 text-gray-800' }
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
