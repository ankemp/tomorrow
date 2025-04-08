import { Changeset } from '@signaldb/core/index';
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
  autostart: false,
  persistenceAdapter: (name) => createIndexedDBAdapter(name),
  pull: async ({ apiPath, jsonReviver }, { lastFinishedSyncStart }) => {
    const settings = getSettings();

    let changes: Changeset<any> = await fetch(
      `${apiPath}/user/${settings.userId}?since=${lastFinishedSyncStart}&encrypted=${settings.encryption}`,
    )
      .then((res) => res.text())
      .then((text) => JSON.parse(text, jsonReviver || undefined));

    if (settings.encryption) {
      const key = settings._encryptionKey as string;
      changes = {
        added: changes.added.map(async (item) => {
          const decrypted = await decryptContent(key, item.encryptContent);
          return JSON.parse(decrypted, jsonReviver || undefined);
        }),
        modified: changes.modified.map(async (item) => {
          const decrypted = await decryptContent(key, item.encryptContent);
          return JSON.parse(decrypted, jsonReviver || undefined);
        }),
        removed: changes.removed,
      };
    }

    return { changes };
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
          body: JSON.stringify({
            id: item.id,
            content: item,
            encrypted: settings.encryption,
          }),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );
  },
  registerRemoteChange: ({ apiPath, jsonReviver }, onChange) => {
    const settings = getSettings();
    const eventSource = new EventSource(
      `${apiPath}/events/user/${settings.userId}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data, jsonReviver);
        onChange(data);
      } catch (err) {
        console.error('Failed to parse remote change event data', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Error with remote change EventSource', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },
});
