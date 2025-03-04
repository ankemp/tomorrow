import { TaskSort } from '../collections/task.collection';

export type SettingsState = {
  _encryptionKey: string | null;
  autoCompleteTasks: 'always' | 'never' | 'ask';
  defaultReminderCategory: string | null;
  defaultReminderTime: string;
  defaultReminderTimeAfterCreation: number; // in minutes
  deviceId: string | null;
  encryption: boolean;
  locale: string;
  remoteSync: boolean;
  sort: Record<string, TaskSort>; // saveKey, sort
  startOfWeek: string;
  syncDevices: Record<string, string>; // id, userAgent
  timeFormat: string;
  timeSpecificity: 'always' | 'never' | 'optional';
  userId: string | null;
};

export interface QRCodeData {
  use: 'tomorrow';
  key: JsonWebKey;
  userId: string;
  encryption: boolean;
  createdAt: number;
}
