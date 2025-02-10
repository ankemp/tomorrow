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

interface Task {
  id: string;
  attachments: string[];
}

interface AttachmentState {
  taskId: string;
  attachments: string[];
  files: File[];
}

const initialState: AttachmentState = {
  taskId: '',
  attachments: [],
  files: [],
};

export const Attachments = signalStore(
  withState<AttachmentState>(initialState),
  withComputed((state) => ({
    hasAttachments: computed(() => state.attachments().length > 0),
    storagePath: computed(() => `/files/${state.taskId()}`, {
      equal: (a, b) => a === b,
    }),
    fileCount: computed(() => state.files().length),
  })),
  withMethods((store) => ({
    dispose() {
      patchState(store, initialState);
    },
    init({ id, attachments }: { id: string; attachments?: string[] }) {
      patchState(store, { taskId: id, attachments: attachments ?? [] });
    },
    setFiles(files: File[]) {
      patchState(store, { files });
    },
    async addAttachments(attachments: File[]) {
      const path = store.storagePath();
      const d = await dir(path);
      if (!(await d.exists())) {
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
