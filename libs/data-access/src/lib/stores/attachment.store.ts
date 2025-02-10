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
    storagePath: computed(() => `/files/${state.taskId()}`, {
      equal: (a, b) => a === b,
    }),
    fileCount: computed(() => state.files().length),
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
      if (await d.exists()) {
        await d.remove();
        await d.create();
      } else {
        await d.create();
      }
      await Promise.all(
        attachments.map((file) => write(`${path}/${file.name}`, file.stream())),
      );
      patchState(store, {
        attachments: attachments.map((f) => f.name),
      });
    },
  })),
  withHooks({
    onInit(store) {
      effect(async () => {
        store.getQuota();
        if (store.hasAttachments()) {
          const attachments = store.attachments();
          const path = store.storagePath();
          console.log(await dir(path).children());
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
