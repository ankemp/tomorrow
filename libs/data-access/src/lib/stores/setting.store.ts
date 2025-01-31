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
};

const initialState: SettingsState = {
  defaultReminderTime: '08:00',
  startOfWeek: 'Sunday',
  timeFormat: '12h',
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
