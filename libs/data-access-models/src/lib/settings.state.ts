import type { ArrayValues, Except } from 'type-fest';

import { TaskSort } from './task.model';

export const NO_SYNC_KEYS: (keyof SettingsState)[] = [
  '_encryptionKey',
  'deviceId',
  'encryption',
  'remoteSync',
  'userId',
];

type AlwaysNeverAsk = 'always' | 'never' | 'ask';

export type SettingsState = {
  _encryptionKey: string | null;
  autoCompleteTasks: AlwaysNeverAsk;
  categoryDisplay: 'name' | 'icon' | 'name_and_icon';
  defaultReminderCategory: string | null;
  defaultReminderState: AlwaysNeverAsk;
  defaultReminderTime: string;
  defaultReminderTimeAfterCreation: number; // in minutes
  deviceId: string | null;
  encryption: boolean;
  locale: string;
  onCreateRedirectTo: 'dashboard' | 'task';
  remoteSync: boolean;
  snoozeTime: number;
  sort: Record<string, TaskSort>; // saveKey, sort
  startOfWeek: string;
  syncDevices: Record<string, string>; // deviceId, userAgent
  timeFormat: string;
  timeSpecificity: 'always' | 'never' | 'optional';
  userId: string | null;
};

export type SyncedSettingsState = Except<
  SettingsState,
  ArrayValues<typeof NO_SYNC_KEYS>
>;

export interface QRCodeData {
  use: 'tomorrow';
  key: JsonWebKey;
  userId: string;
  encryption: boolean;
  createdAt: number;
}
