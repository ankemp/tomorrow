export type SettingsState = {
  defaultReminderTime: string;
  startOfWeek: string;
  timeFormat: string;
  locale: string;
  userId: string | null;
  remoteSync: boolean;
  encryption: boolean;
  _encryptionKey: string | null;
};
