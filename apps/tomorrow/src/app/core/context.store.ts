import { computed, inject } from '@angular/core';
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
import { TuiAlertService } from '@taiga-ui/core';
import { TuiPushService } from '@taiga-ui/kit';
import { EMPTY, fromEvent, iif, map, merge, pipe, switchMap, tap } from 'rxjs';

interface ContextState {
  isOnline: boolean;
}

const initialState: ContextState = {
  isOnline: navigator.onLine,
};

export const Context = signalStore(
  { providedIn: 'root' },
  withState<ContextState>(initialState),
  withProps(() => ({
    swUpdateService: inject(SwUpdate),
    alertService: inject(TuiAlertService),
    pushService: inject(TuiPushService),
  })),
  withComputed((state) => ({
    isOffline: computed(() => !state.isOnline()),
  })),
  withMethods((store) => ({
    watchIsOnline: rxMethod<void>(
      pipe(
        switchMap(() =>
          merge(
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
              return store.alertService.open(
                'A new version is downloading in the background.',
                {
                  label: 'Update Available',
                  icon: '@tui.material.outlined.security_update',
                },
              );
            case 'VERSION_READY':
              return store.pushService
                .open('New version installed. Please reload the app.', {
                  heading: 'New version installed',
                  icon: '@tui.material.outlined.security_update_good',
                  buttons: ['Reload'],
                })
                .pipe(
                  tap((resp) => {
                    if (resp === 'Reload') {
                      window.location.reload();
                    }
                  }),
                );
            case 'VERSION_INSTALLATION_FAILED':
              return store.alertService.open(
                'New version installed. Please reload the app.',
                {
                  label: 'New version installed',
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
      store.watchIsOnline();
      store.watchUpdates();
      // effect(async () => {});
    },
  }),
);
