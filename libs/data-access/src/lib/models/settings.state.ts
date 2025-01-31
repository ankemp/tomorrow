export type SettingsState = {
  defaultReminderTime: string;
  startOfWeek: string;
  timeFormat: string;
  remoteSync: boolean;
  encryption: boolean;
  _encryptionKey: string | null;
};
