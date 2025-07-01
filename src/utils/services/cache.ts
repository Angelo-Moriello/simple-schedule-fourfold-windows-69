
import { ServiceCategories } from './types';

// Global services cache
let globalServices: ServiceCategories | null = null;
let realtimeChannel: any = null;

export const getServicesCache = (): ServiceCategories | null => {
  return globalServices;
};

export const setServicesCache = (services: ServiceCategories): void => {
  globalServices = services;
};

export const clearServicesCache = (): void => {
  console.log('DEBUG - Clearing services cache');
  globalServices = null;
};

export const getRealtimeChannel = (): any => {
  return realtimeChannel;
};

export const setRealtimeChannel = (channel: any): void => {
  realtimeChannel = channel;
};
