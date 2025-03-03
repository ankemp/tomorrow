export type SettingsState = {
  lastSyncTime: number;
  defaultReminderTime: string;
  defaultReminderTimeAfterCreation: number; // in minutes
  defaultReminderCategory: string | null;
  startOfWeek: string;
  timeFormat: string;
  timeSpecificity: 'always' | 'never' | 'optional';
  autoCompleteTasks: 'always' | 'never' | 'ask';
  locale: string;
  userId: string | null;
  deviceId: string | null;
  remoteSync: boolean;
  syncDevices: Record<string, string>; // id, userAgent
  encryption: boolean;
  _encryptionKey: string | null;
};

export interface QRCodeData {
  use: 'tomorrow';
  key: JsonWebKey;
  userId: string;
  encryption: boolean;
  createdAt: number;
}
