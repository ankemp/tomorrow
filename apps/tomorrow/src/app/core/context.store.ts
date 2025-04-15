import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TuiAlertService, TuiBreakpointService } from '@taiga-ui/core';
import {
  EMPTY,
  fromEvent,
  iif,
  map,
  merge,
  pipe,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

interface ContextState {
  isOnline: boolean;
  isUpdating: boolean;
  updateReady: boolean;
}

const initialState: ContextState = {
  isOnline: navigator.onLine,
  isUpdating: false,
  updateReady: false,
};

export const Context = signalStore(
  { providedIn: 'root' },
  withState<ContextState>(initialState),
  withProps(() => ({
    swUpdateService: inject(SwUpdate),
    alertService: inject(TuiAlertService),
    breakpointService: inject(TuiBreakpointService),
  })),
  withComputed((state) => ({
    isOffline: computed(() => !state.isOnline()),
    isMobile: toSignal(
      inject(TuiBreakpointService).pipe(
        map((size) => size === 'mobile'),
        startWith(true),
      ),
    ),
    canVibrate: computed(
      () => typeof navigator !== 'undefined' && 'vibrate' in navigator,
    ),
  })),
  withMethods((store) => ({
    watchIsOnline: rxMethod<void>(
      pipe(
        switchMap(() =>
          merge(
            // FIXME: Causes references error on server.
            fromEvent(window, 'offline').pipe(map(() => false)),
            fromEvent(window, 'online').pipe(map(() => true)),
          ),
        ),
        tap((isOnline) => {
          patchState(store, { isOnline });
        }),
      ),
    ),
    watchUpdates: rxMethod<void>(
      pipe(
        switchMap(() =>
          iif(
            () => store.swUpdateService.isEnabled,
            store.swUpdateService.versionUpdates,
            EMPTY,
          ),
        ),
        switchMap((event) => {
          switch (event.type) {
            case 'VERSION_DETECTED':
              patchState(store, { isUpdating: true });
              return store.alertService.open(
                'A new version is downloading in the background.',
                {
                  label: 'Update Available',
                  icon: '@tui.material.outlined.security_update',
                },
              );
            case 'VERSION_READY':
              patchState(store, { isUpdating: false, updateReady: true });
              return store.alertService.open(
                'New version installed. Please reload the app.',
                {
                  label: 'New version installed',
                  icon: '@tui.material.outlined.security_update_good',
                  closeable: false,
                  autoClose: 0,
                },
              );
            case 'VERSION_INSTALLATION_FAILED':
              patchState(store, { isUpdating: false });
              return store.alertService.open(
                'The update could not be installed. Please try again later. If the problem persists, open a ticket on Github.',
                {
                  label: 'Update Failed',
                  icon: '@tui.material.outlined.security_update_warning',
                },
              );
            default:
              return EMPTY;
          }
        }),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      if (typeof window !== 'undefined') {
        store.watchIsOnline();
        store.watchUpdates();
      }
    },
  }),
);
