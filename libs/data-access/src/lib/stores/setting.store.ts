import { HttpClient } from '@angular/common/http';
import { computed, effect, inject } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { TuiDayOfWeek, TuiTimeMode } from '@taiga-ui/cdk';
import { catchError, EMPTY, firstValueFrom, map } from 'rxjs';

import { generateSymmetricKey } from '@tmrw/encryption';

import { Tasks } from '../collections/task.collection';
import { SettingsState } from '../models/settings.state';
// import { syncManager } from '../sync-manager';

const initialState: SettingsState = {
  lastSyncTime: 0,
  defaultReminderTime: '08:00',
  defaultReminderCategory: null,
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
  withProps(() => ({
    http: inject(HttpClient),
  })),
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
    qrCodeString: computed(() => {
      const key = state._encryptionKey();
      const userId = state.userId();
      if (!key || !userId) {
        return null;
      }
      return JSON.stringify({
        key: JSON.parse(key),
        userId,
        createdAt: Date.now(),
      });
    }),
    hasEncryptionKey: computed(() => !!state._encryptionKey()),
  })),
  withMethods((store) => ({
    updateDefaultReminderTime(defaultReminderTime: string): void {
      patchState(store, { defaultReminderTime });
    },
    updateDefaultReminderCategory(defaultReminderCategory: string): void {
      patchState(store, { defaultReminderCategory });
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
    setLastSynced(): void {
      patchState(store, { lastSyncTime: Date.now() });
    },
  })),
  withHooks({
    onInit(store) {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const settingsString = localStorage.getItem('settings');
        if (settingsString) {
          const settings = JSON.parse(settingsString) as SettingsState;
          patchState(store, settings);
          if (settings.remoteSync && settings.userId) {
            getUserSettings(store.http, settings.userId);
          }
        }
        effect(() => {
          const state = getState(store);
          localStorage.setItem('settings', JSON.stringify(state));
          if (state.remoteSync && state.userId) {
            pushUserSettings(store.http, state);
          }
        });
      }
    },
  }),
);

function pushUserSettings(http: HttpClient, settings: SettingsState) {
  return firstValueFrom(
    http
      .post<void>(`user/${settings.userId}`, {
        settings: {
          defaultReminderTime: settings.defaultReminderTime,
          defaultReminderCategory: settings.defaultReminderCategory,
          startOfWeek: settings.startOfWeek,
          timeFormat: settings.timeFormat,
          locale: settings.locale,
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Failed to push user settings', error);
          return EMPTY;
        }),
      ),
  );
}

function getUserSettings(http: HttpClient, userId: string) {
  return firstValueFrom(
    http.get(`user/${userId}`).pipe(
      map((settings) => settings as Partial<SettingsState>),
      catchError((error) => {
        console.error('Failed to get user settings', error);
        return EMPTY;
      }),
    ),
  );
}
