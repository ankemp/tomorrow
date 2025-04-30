import { HttpClient, HttpParams } from '@angular/common/http';
import angularReactivityAdapter from '@signaldb/angular';
import { Changeset } from '@signaldb/core/index';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import { SyncManager } from '@signaldb/sync';
import { firstValueFrom, map } from 'rxjs';

import { SettingsState } from '@tmrw/data-access-models';
import { decryptContent, encryptContent } from '@tmrw/encryption';

// TODO: Possible to replace this with settings store? Pass in though DI in appInit?
function getSettings(): SettingsState {
  const settings = localStorage.getItem('settings');
  return settings ? JSON.parse(settings) : {};
}

export const syncManager = new SyncManager({
  autostart: false,
  reactivity: angularReactivityAdapter,
  persistenceAdapter: (name) => createIndexedDBAdapter(name),
  pull: ({ apiPath, httpClient, jsonReviver }, { lastFinishedSyncStart }) => {
    const settings = getSettings();

    let params = new HttpParams();
    if (settings.userId) {
      params = params.append('userId', settings.userId);
    }
    if (settings.deviceId) {
      params = params.append('deviceId', settings.deviceId);
    }
    params = params.append('encrypted', settings.encryption);
    if (lastFinishedSyncStart) {
      params = params.append('since', lastFinishedSyncStart);
    }

    return firstValueFrom(
      (httpClient as HttpClient)
        .get(apiPath, {
          params: params,
          responseType: 'text',
        })
        .pipe(
          map((text) => {
            return JSON.parse(text, jsonReviver || undefined);
          }),
          map((changes: Changeset<any>) => {
            if (!settings.encryption) {
              return changes;
            }
            const key = settings._encryptionKey as string;
            return {
              added: changes.added.map(async (item) => {
                const decrypted = await decryptContent(
                  key,
                  item.encryptContent,
                );
                return JSON.parse(decrypted, jsonReviver || undefined);
              }),
              modified: changes.modified.map(async (item) => {
                const decrypted = await decryptContent(
                  key,
                  item.encryptContent,
                );
                return JSON.parse(decrypted, jsonReviver || undefined);
              }),
              removed: changes.removed,
            };
          }),
          map((changes: Changeset<any>) => {
            return { changes };
          }),
        ),
    );
  },
  push: async ({ apiPath, httpClient }, { changes }) => {
    const settings = getSettings();
    const key =
      settings && settings.encryption ? settings._encryptionKey : undefined;

    if (changes.added.length > 0) {
      await firstValueFrom(
        (httpClient as HttpClient).post(
          apiPath,
          {
            userId: settings.userId,
            deviceId: settings.deviceId,
            encrypted: settings.encryption,
            changes: changes.added.map((item) => {
              return {
                id: item.id,
                content: key ? encryptContent(key, JSON.stringify(item)) : item,
              };
            }),
          },
          { responseType: 'text' },
        ),
      );
    }

    if (changes.modified.length > 0) {
      await firstValueFrom(
        (httpClient as HttpClient).put(
          apiPath,
          {
            userId: settings.userId,
            deviceId: settings.deviceId,
            encrypted: settings.encryption,
            changes: changes.modified.map((item) => {
              return {
                id: item.id,
                content: key ? encryptContent(key, JSON.stringify(item)) : item,
              };
            }),
          },
          { responseType: 'text' },
        ),
      );
    }

    if (changes.removed.length > 0) {
      await firstValueFrom(
        (httpClient as HttpClient).delete(apiPath, {
          body: {
            userId: settings.userId,
            deviceId: settings.deviceId,
            encrypted: settings.encryption,
            changes: changes.removed.map((item) => {
              return {
                id: item.id,
                content: key ? encryptContent(key, JSON.stringify(item)) : item,
              };
            }),
          },
          responseType: 'text',
        }),
      );
    }
  },
  registerRemoteChange: ({ apiPath, jsonReviver, eventType }, onChange) => {
    const settings = getSettings();
    const eventSource = new EventSource(
      `${apiPath}/events/user/${settings.userId}?deviceId=${settings.deviceId}`,
    );

    eventSource.addEventListener(eventType, (event) => {
      try {
        const data: Changeset<any> = JSON.parse(event.data, jsonReviver);
        if (settings.encryption) {
          const key = settings._encryptionKey as string;
          data.added = data.added.map(async (item) => {
            const decrypted = await decryptContent(key, item.encryptContent);
            return JSON.parse(decrypted, jsonReviver || undefined);
          });
          data.modified = data.modified.map(async (item) => {
            const decrypted = await decryptContent(key, item.encryptContent);
            return JSON.parse(decrypted, jsonReviver || undefined);
          });
        }
        onChange({ changes: data });
      } catch (err) {
        console.error('Failed to parse remote change event data', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('Error with remote change EventSource', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },
});
