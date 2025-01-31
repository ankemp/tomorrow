import { effect } from '@angular/core';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

type SettingsState = {
  startOfWeek: string;
  timeFormat: string;
};

const initialState: SettingsState = {
  startOfWeek: 'Sunday',
  timeFormat: '12h',
};

export const Settings = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
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
        effect(() => {
          const state = getState(store);
          localStorage.setItem('settings', JSON.stringify(state));
        });
      }
    },
  }),
);
