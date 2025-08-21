import { get, set, del } from 'idb-keyval';

const PREFIX = 'backup-payload:';

export const saveBackupPayload = async (payload: string, key?: string): Promise<string> => {
  const k = `${PREFIX}${key || crypto.randomUUID()}`;
  await set(k, payload);
  return k.replace(PREFIX, '');
};

export const getBackupPayload = async (key: string): Promise<string | null> => {
  const value = await get(`${PREFIX}${key}`);
  if (typeof value === 'string') return value;
  if (value == null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

export const deleteBackupPayload = async (key: string): Promise<void> => {
  await del(`${PREFIX}${key}`);
};
