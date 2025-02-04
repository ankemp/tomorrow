import { computed, effect } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TuiDayOfWeek, TuiTimeMode } from '@taiga-ui/cdk';

import { generateSymmetricKey } from '@tmrw/encryption';

import { Tasks } from '../collections/task.collection';
import { SettingsState } from '../models/settings.state';
// import { syncManager } from '../sync-manager';

const initialState: SettingsState = {
  defaultReminderTime: '08:00',
  startOfWeek: 'Sunday',
  timeFormat: '12h',
  locale: 'en-US', // TODO: Get from browser(?)
  userId: null,
  remoteSync: false,
  encryption: false,
  _encryptionKey: null,
};

export const Settings = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    tuiTimeFormat: computed(
      () =>
        (state.timeFormat() === '12h'
          ? 'HH:MM AA'
          : 'HH:MM') satisfies TuiTimeMode,
    ),
    tuiFirstDayOfWeek: computed(() => {
      const day = state.startOfWeek() as keyof typeof TuiDayOfWeek;
      return TuiDayOfWeek[day];
    }),
    dateFnsTimeFormat: computed(() =>
      state.timeFormat() === '12h' ? 'hh:mm a' : 'HH:mm',
    ),
    jwtKey: computed(() => {
      const key = state._encryptionKey();
      return key ? JSON.parse(key) : null;
    }),
    hasEncryptionKey: computed(() => !!state._encryptionKey()),
  })),
  withMethods((store) => ({
    updateDefaultReminderTime(defaultReminderTime: string): void {
      patchState(store, { defaultReminderTime });
    },
    updateTimeFormat(timeFormat: string): void {
      patchState(store, { timeFormat });
    },
    updateStartOfWeek(startOfWeek: string): void {
      patchState(store, { startOfWeek });
    },
    async updateRemoteSync(remoteSync: boolean): Promise<void> {
      const state = getState(store);
      if (remoteSync && !state.userId) {
        const userId = window.crypto.randomUUID();
        patchState(store, { userId: userId });
        Tasks.attachUserId(userId);
      }
      if (remoteSync && !state._encryptionKey) {
        const key = await generateSymmetricKey();
        const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
        patchState(store, { _encryptionKey: JSON.stringify(exportedKey) });
      }
      patchState(store, {
        remoteSync,
        encryption: remoteSync === false ? false : state.encryption,
      });
    },
    updateEncryption(encryption: boolean): void {
      // TODO: Force push data to remote server.
      // TODO: Clear old data from remote server.
      patchState(store, { encryption });
      // syncManager.sync('tasks', {force: true});
    },
  })),
  withHooks({
    onInit(store) {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const settings = localStorage.getItem('settings');
        if (settings) {
          patchState(store, JSON.parse(settings));
        }
        effect(() => {
          const state = getState(store);
          localStorage.setItem('settings', JSON.stringify(state));
        });
      }
    },
  }),
);
