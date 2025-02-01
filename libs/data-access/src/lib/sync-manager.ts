import createIndexedDBAdapter from '@signaldb/indexeddb';
import { SyncManager } from '@signaldb/sync';

import { decryptContent, encryptContent } from '@tmrw/encryption';

import { SettingsState } from './models/settings.state';

const HEADERS = {
  'Content-Type': 'application/json',
};

function getSettings(): SettingsState {
  const settings = localStorage.getItem('settings');
  return settings ? JSON.parse(settings) : {};
}

export const syncManager = new SyncManager({
  // reactivityAdapter: angularReactivityAdapter,
  autostart: false,
  persistenceAdapter: (name) => createIndexedDBAdapter(name),
  pull: async ({ apiPath }, { lastFinishedSyncStart }) => {
    const settings = getSettings();

    let data: any[] = await fetch(
      `${apiPath}?since=${lastFinishedSyncStart}&encrypted=${settings.encryption}`,
    ).then((res) => res.json());

    if (settings.encryption) {
      const key = settings._encryptionKey as string;
      data = await Promise.all(
        data.map(async (item) => {
          const content = await decryptContent(key, item.encryptedData);

          return JSON.parse(content);
        }),
      );
    }

    data = data.map((item) => {
      return {
        ...item,
        date: new Date(item.date),
        completedAt: item.completedAt ? new Date(item.completedAt) : null,
      };
    });

    return { items: data };
  },
  push: async ({ apiPath }, { changes }) => {
    const settings = getSettings();
    const key =
      settings && settings.encryption ? settings._encryptionKey : undefined;

    await Promise.all(
      changes.added.map(async (item) => {
        const body = key
          ? await encryptContent(key, JSON.stringify(item))
          : item;

        const response = await fetch(apiPath, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({
            id: item.id,
            encrypted: settings.encryption,
            content: body,
          }),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );

    await Promise.all(
      changes.modified.map(async (item) => {
        const body = key
          ? await encryptContent(key, JSON.stringify(item))
          : item;
        const response = await fetch(apiPath, {
          method: 'PUT',
          headers: HEADERS,
          body: JSON.stringify({
            id: item.id,
            encrypted: settings.encryption,
            content: body,
          }),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );

    await Promise.all(
      changes.removed.map(async (item) => {
        const response = await fetch(apiPath, {
          method: 'DELETE',
          headers: HEADERS,
          body: JSON.stringify({ id: item.id, encrypted: settings.encryption }),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );
  },
});
