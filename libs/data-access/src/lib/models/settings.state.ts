export type SettingsState = {
  defaultReminderTime: string;
  startOfWeek: string;
  timeFormat: string;
  userId: string | null;
  remoteSync: boolean;
  encryption: boolean;
  _encryptionKey: string | null;
};
