
export interface ServiceCategory {
  name: string;
  services: string[];
}

export type ServiceCategories = Record<'Parrucchiere' | 'Estetista', ServiceCategory>;

// Default services that should always be available
export const DEFAULT_SERVICES: ServiceCategories = {
  Parrucchiere: {
    name: 'Parrucchiere',
    services: [
      'Piega', 'Colore', 'Taglio', 'Colpi di sole', 'Trattamento Capelli',
      'Permanente', 'Stiratura', 'Extension', 'Balayage', 'Shatush',
      'Mèches', 'Decolorazione', 'Tinta', 'Riflessante'
    ]
  },
  Estetista: {
    name: 'Estetista',
    services: [
      'Pulizia Viso', 'Manicure', 'Pedicure', 'Massaggio', 'Depilazione', 'Trattamento Corpo',
      'Ricostruzione Unghie', 'Semipermanente', 'Trattamento Viso', 'Ceretta',
      'Peeling', 'Maschera Viso', 'Pressoterapia', 'Linfodrenaggio'
    ]
  }
};
