export type SettingsState = {
  lastSyncTime: number;
  defaultReminderTime: string;
  defaultReminderCategory: string | null;
  startOfWeek: string;
  timeFormat: string;
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
