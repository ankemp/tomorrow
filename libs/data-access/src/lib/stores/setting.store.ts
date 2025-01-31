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

type SettingsState = {
  defaultReminderTime: string;
  startOfWeek: string;
  timeFormat: string;
  remoteSync: boolean;
  encryption: boolean;
  _encryptionKey: JsonWebKey | null;
};

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
    updateRemoteSync(remoteSync: boolean): void {
      patchState(store, { remoteSync });
    },
    async updateEncryption(encryption: boolean): Promise<void> {
      const state = getState(store);
      if (!state._encryptionKey) {
        const key = await window.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt'],
        );
        const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
        patchState(store, { _encryptionKey: exportedKey });
      }
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
