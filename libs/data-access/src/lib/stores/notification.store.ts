import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { from, map, pipe, switchMap, tap } from 'rxjs';

import { Settings } from './setting.store';

interface NotificationState {
  serverPublicKey: string | null;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}

const initialState: NotificationState = {
  serverPublicKey: null,
  isSubscribed: false,
  subscription: null,
};

export const Notifications = signalStore(
  { providedIn: 'root' },
  withState<NotificationState>(initialState),
  withProps(() => ({
    http: inject(HttpClient),
    swPush: inject(SwPush),
    settings: inject(Settings),
  })),
  withMethods((store) => ({
    getServerPublicKey: rxMethod<void>(
      pipe(
        switchMap(() => {
          return store.http
            .get<{ publicKey: string }>('api/notifications/public-key')
            .pipe(
              tap(({ publicKey }) => {
                patchState(store, { serverPublicKey: publicKey });
              }),
            );
        }),
      ),
    ),
    subscribe: rxMethod<void>(
      pipe(
        map(() => {
          const serverPublicKey = getState(store).serverPublicKey;
          if (!serverPublicKey) {
            throw new Error('Server public key is not set.');
          }
          return serverPublicKey;
        }),
        switchMap((serverPublicKey) => {
          return from(
            store.swPush.requestSubscription({ serverPublicKey }),
          ).pipe(
            switchMap((subscription) => {
              return store.http
                .post('api/notifications/subscribe', {
                  userId: store.settings.userId(),
                  deviceId: store.settings.deviceId(),
                  subscription,
                })
                .pipe(
                  tap(() => {
                    patchState(store, {
                      isSubscribed: true,
                      subscription,
                    });
                  }),
                );
            }),
          );
        }),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.getServerPublicKey();
    },
  }),
);
