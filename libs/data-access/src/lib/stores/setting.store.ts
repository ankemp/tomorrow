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
import { TuiTimeMode } from '@taiga-ui/cdk';

import { generateSymmetricKey } from '@tmrw/encryption';

import { SettingsState } from '../models/settings.state';

const initialState: SettingsState = {
  defaultReminderTime: '08:00',
  startOfWeek: 'Sunday',
  timeFormat: '12h',
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
      if (!state._encryptionKey) {
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
      patchState(store, { encryption });
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
