import { TaskSort } from './task.model';

export type SettingsState = {
  _encryptionKey: string | null;
  autoCompleteTasks: 'always' | 'never' | 'ask';
  categoryDisplay: 'name' | 'icon' | 'name_and_icon';
  defaultReminderCategory: string | null;
  defaultReminderTime: string;
  defaultReminderTimeAfterCreation: number; // in minutes
  deviceId: string | null;
  encryption: boolean;
  locale: string;
  remoteSync: boolean;
  sort: Record<string, TaskSort>; // saveKey, sort
  startOfWeek: string;
  syncDevices: Record<string, string>; // deviceId, userAgent
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
