export type SettingsState = {
  lastSyncTime: number;
  defaultReminderTime: string;
  defaultReminderCategory: string | null;
  startOfWeek: string;
  timeFormat: string;
  locale: string;
  userId: string | null;
  deviceId: string | null;
  remoteSync: boolean;
  syncDevices: Record<string, string>; // id, userAgent
  encryption: boolean;
  _encryptionKey: string | null;
};
