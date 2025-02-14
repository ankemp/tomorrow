import { computed, effect } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { dir, file, write } from 'opfs-tools';

interface AttachmentState {
  taskId: string;
  attachments: string[];
  files: File[];
  fsQuota: number;
  fsUsage: number;
}

const initialState: AttachmentState = {
  taskId: '',
  attachments: [],
  files: [],
  fsQuota: 0,
  fsUsage: 0,
};

export const Attachments = signalStore(
  withState<AttachmentState>(initialState),
  withComputed((state) => ({
    hasAttachments: computed(() => state.attachments().length > 0),
    fileCount: computed(() => state.attachments().length),
    storagePath: computed(() => `/files/${state.taskId()}`),
    fsUsagePercent: computed(() =>
      state.fsQuota() > 0 ? (state.fsUsage() / state.fsQuota()) * 100 : 0,
    ),
  })),
  withMethods((store) => ({
    async getQuota() {
      if ('storage' in navigator) {
        const estimate = await navigator.storage.estimate();
        patchState(store, { fsQuota: estimate.quota, fsUsage: estimate.usage });
      }
    },
    dispose() {
      patchState(store, initialState);
    },
    init({ id, attachments }: { id: string; attachments?: string[] }) {
      patchState(store, { taskId: id, attachments: attachments ?? [] });
    },
    setFiles(files: File[]) {
      patchState(store, { files });
    },
    async setAttachments(attachments: File[]) {
      const path = store.storagePath();
      const d = await dir(path);
      if (!(await d.exists())) {
        await d.create();
      }
      for (const file of attachments) {
        try {
          await write(`${path}/${file.name}`, file.stream());
        } catch (error) {
          console.error(error);
        }
      }
      patchState(store, {
        attachments: attachments.map((f) => f.name),
      });
    },
    async updateAttachments(attachments: File[]) {
      if (!store.hasAttachments()) {
        await this.setAttachments(attachments);
      } else {
        const oldFiles = store.files();
        const { added, deleted, modified, unchanged } = await compareFiles(
          oldFiles,
          attachments,
        );
        const path = store.storagePath();
        for (const f of added) {
          await write(`${path}/${f.name}`, f.stream());
        }
        for (const f of deleted) {
          await file(`${path}/${f.name}`).remove();
        }
        for (const f of modified) {
          await write(`${path}/${f.name}`, f.stream(), { overwrite: true });
        }
        patchState(store, {
          attachments: [
            ...unchanged.map((f) => f.name),
            ...added.map((f) => f.name),
          ],
        });
      }
    },
    async clearAttachments() {
      const path = store.storagePath();
      const d = await dir(path);
      if (await d.exists()) {
        await d.remove();
      }
      patchState(store, { attachments: [], files: [] });
    },
    async clearStorage() {
      await dir('/files').remove();
      await this.getQuota();
    },
  })),
  withHooks({
    onInit(store) {
      effect(async () => {
        store.getQuota();
        if (store.hasAttachments()) {
          const attachments = store.attachments();
          const path = store.storagePath();
          const files = await Promise.all(
            attachments
              .map((attachment) => file(`${path}/${attachment}`))
              .filter(async (f) => await f.exists())
              .map((f) => f.getOriginFile() as Promise<File>),
          );
          store.setFiles(files);
        }
      });
    },
  }),
);

async function getFileHash(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        try {
          const msgBuffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          resolve(hashHex);
        } catch (err) {
          reject('Hashing error: ' + err);
        }
      } else {
        reject('Error reading file or not an ArrayBuffer');
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file); // This works for ALL file types
  });
}

async function compareFiles(
  oldFiles: File[],
  newFiles: File[],
): Promise<{
  added: File[];
  deleted: File[];
  modified: File[];
  unchanged: File[];
}> {
  const hashToFile = new Map<string, File>();
  const oldFileHashes = new Map<string, string>();
  for (const file of oldFiles) {
    try {
      const hash = await getFileHash(file);
      oldFileHashes.set(file.name, hash);
      hashToFile.set(hash, file);
    } catch (error) {
      console.error(`Error hashing old file ${file.name}:`, error);
      // Handle the error appropriately, e.g., skip the file or throw an exception.
      // For this example, we'll skip the file:
      continue; // Skip to the next file
    }
  }

  const newFileHashes = new Map<string, string>();
  for (const file of newFiles) {
    try {
      const hash = await getFileHash(file);
      newFileHashes.set(file.name, hash);
      hashToFile.set(hash, file);
    } catch (error) {
      console.error(`Error hashing new file ${file.name}:`, error);
      continue; // Skip to the next file
    }
  }

  const added: string[] = [];
  const deleted: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const [name, hash] of newFileHashes) {
    if (!oldFileHashes.has(name)) {
      added.push(hash);
    } else {
      const oldHash = oldFileHashes.get(name)!; // Safe to use ! since we checked has()
      const newHash = newFileHashes.get(name)!;
      if (oldHash !== newHash) {
        modified.push(hash); // Or both oldFile and newFile if you need both
      } else {
        unchanged.push(hash); // Or both oldFile and newFile if you need both
      }
    }
  }

  for (const [name, hash] of oldFileHashes) {
    if (!newFileHashes.has(name)) {
      deleted.push(hash);
    }
  }

  return {
    added: added.map((hash) => hashToFile.get(hash)!),
    deleted: deleted.map((hash) => hashToFile.get(hash)!),
    modified: modified.map((hash) => hashToFile.get(hash)!),
    unchanged: unchanged.map((hash) => hashToFile.get(hash)!),
  };
}
