
import { ServiceCategories } from './types';

export const emitServicesUpdatedEvent = (services: ServiceCategories): void => {
  window.dispatchEvent(new CustomEvent('servicesUpdated', { 
    detail: services 
  }));
};

export const addEventListener = (callback: (event: CustomEvent) => void): void => {
  window.addEventListener('servicesUpdated', callback as EventListener);
};

export const removeEventListener = (callback: (event: CustomEvent) => void): void => {
  window.removeEventListener('servicesUpdated', callback as EventListener);
};
