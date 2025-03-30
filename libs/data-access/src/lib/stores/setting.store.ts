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
import { omit } from 'es-toolkit';
import { catchError, EMPTY, firstValueFrom, map } from 'rxjs';

import { generateSymmetricKey } from '@tmrw/encryption';

import { Tasks, TaskSort } from '../collections/task.collection';
import { QRCodeData, SettingsState } from '../models/settings.state';
import { parseUserAgent } from '../utils/user-agent-parser';

const NO_SYNC_KEYS: (keyof SettingsState)[] = [
  '_encryptionKey',
  'deviceId',
  'encryption',
  'remoteSync',
  'userId',
];

const initialState: SettingsState = {
  _encryptionKey: null,
  autoCompleteTasks: 'ask',
  categoryDisplay: 'name',
  defaultReminderCategory: null,
  defaultReminderTime: '08:00',
  defaultReminderTimeAfterCreation: 60,
  deviceId: null,
  encryption: false,
  locale: 'en-US', // TODO: Get from browser(?)
  remoteSync: false,
  sort: {},
  startOfWeek: 'Sunday',
  syncDevices: {},
  timeFormat: '12h',
  timeSpecificity: 'always',
  userId: null,
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
    dateFnsStartOfWeek: computed(() => {
      const startOfWeek = state.startOfWeek();
      switch (startOfWeek) {
        default:
        case 'Sunday':
          return 0;
        case 'Monday':
          return 1;
        case 'Tuesday':
          return 2;
        case 'Wednesday':
          return 3;
        case 'Thursday':
          return 4;
        case 'Friday':
          return 5;
        case 'Saturday':
          return 6;
      }
    }),
    jwtKey: computed(() => {
      const key = state._encryptionKey();
      return key ? JSON.parse(key) : null;
    }),
    qrCodeString: computed(() => {
      const encryption = state.encryption();
      const key = state._encryptionKey();
      const userId = state.userId();
      if (!key || !userId) {
        return null;
      }
      return JSON.stringify({
        use: 'tomorrow',
        key: JSON.parse(key),
        userId,
        encryption,
        createdAt: Date.now(),
      } satisfies QRCodeData);
    }),
    hasEncryptionKey: computed(() => !!state._encryptionKey()),
    syncDevicesList: computed(() => {
      const deviceId = state.deviceId();
      const devices = state.syncDevices();
      return Object.entries(devices).map(([id, userAgent]) => {
        const { os, deviceType, browser, browserVersion } =
          parseUserAgent(userAgent);
        const thisDevice = id === deviceId;
        let icon = '@tui.material.outlined.device_unknown';
        if (os === 'Android') {
          icon = '@tui.material.outlined.android';
        } else if (os === 'iOS') {
          icon = '@tui.material.outlined.ios';
        } else if (os === 'Windows' || os === 'macOS' || os === 'Linux') {
          icon = '@tui.laptop';
        }
        return {
          id,
          thisDevice,
          userAgent,
          label: `${deviceType} ${os} ${browser} ${browserVersion}`,
          os,
          type: deviceType,
          icon,
          browser,
          browserVersion,
        };
      });
    }),
  })),
  withMethods((store) => ({
    updateDefaultReminderTime(defaultReminderTime: string): void {
      patchState(store, { defaultReminderTime });
    },
    updateDefaultReminderTimeAfterCreation(
      defaultReminderTimeAfterCreation: number,
    ): void {
      patchState(store, { defaultReminderTimeAfterCreation });
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
    updateAutoCompleteTasks(
      autoCompleteTasks: 'always' | 'never' | 'ask',
    ): void {
      patchState(store, { autoCompleteTasks });
    },
    updateTimeSpecificity(
      timeSpecificity: 'always' | 'never' | 'optional',
    ): void {
      patchState(store, { timeSpecificity });
    },
    updateSort(saveKey: string, sort: TaskSort): void {
      patchState(store, { sort: { ...getState(store).sort, [saveKey]: sort } });
    },
    updateCategoryDisplay(
      categoryDisplay: 'name' | 'icon' | 'name_and_icon',
    ): void {
      patchState(store, { categoryDisplay });
    },
    setDeviceId(): void {
      const deviceId = window.crypto.randomUUID();
      patchState(store, {
        deviceId: deviceId,
        syncDevices: { [deviceId]: navigator.userAgent },
      });
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
      // TODO: If user disables remote sync, we need to remove this device from the list on the server
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
    importUser({ userId, encryption, key }: QRCodeData): void {
      patchState(store, {
        userId,
        _encryptionKey: JSON.stringify(key),
        remoteSync: true,
        encryption,
      });
    },
    resetUser() {
      // TODO: Remove user from remote server
      Tasks.detachUserId();
      patchState(store, {
        userId: null,
        _encryptionKey: null,
        remoteSync: false,
        encryption: false,
      });
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
            // TODO: investigate potential race condition here
            // Seems like getting/pushing the settings are acting a bit wonky
            getUserSettings(store.http, settings.userId).then(
              (userSettings) => {
                patchState(store, userSettings);
              },
            );
          }
        } else {
          store.setDeviceId();
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
      .post<void>(`api/users/${settings.userId}`, omit(settings, NO_SYNC_KEYS))
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
    http.get(`api/users/${userId}`).pipe(
      map((settings) => settings as Partial<SettingsState>),
      catchError((error) => {
        console.error('Failed to get user settings', error);
        return EMPTY;
      }),
    ),
  );
}
