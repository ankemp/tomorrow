import createIndexedDBAdapter from '@signaldb/indexeddb';
import { SyncManager } from '@signaldb/sync';

export const syncManager = new SyncManager({
  // reactivityAdapter: angularReactivityAdapter,
  persistenceAdapter: (name) => createIndexedDBAdapter(name),
  pull: async ({ apiPath }, { lastFinishedSyncStart }) => {
    console.log('pulling from', apiPath);
    const data = await fetch(`${apiPath}?since=${lastFinishedSyncStart}`).then(
      (res) => res.json(),
    );

    // decrypt data if needed

    return { items: data };
  },
  push: async ({ apiPath }, { changes }) => {
    await Promise.all(
      changes.added.map(async (item) => {
        const response = await fetch(apiPath, {
          method: 'POST',
          body: JSON.stringify(item),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );

    await Promise.all(
      changes.modified.map(async (item) => {
        const response = await fetch(apiPath, {
          method: 'PUT',
          body: JSON.stringify(item),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );

    await Promise.all(
      changes.removed.map(async (item) => {
        const response = await fetch(apiPath, {
          method: 'DELETE',
          body: JSON.stringify(item),
        });
        if (response.status >= 400 && response.status <= 499) return;
        await response.text();
      }),
    );
  },
  registerRemoteChange: (collectionOptions, onChange) => {
    // …
  },
});
