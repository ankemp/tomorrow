import { HttpClient } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';

import { TASK_SSE_EVENT } from '@tmrw/data-access-models';

import { Tasks } from '../collections/task.collection';
import { syncManager } from '../sync-manager';

export const provideSyncManager = () =>
  provideAppInitializer(() => {
    syncManager.addCollection(Tasks, {
      name: 'tasks',
      apiPath: '/api/tasks',
      eventType: TASK_SSE_EVENT,
      httpClient: inject(HttpClient),
      jsonReviver: (key: string, value: any) => {
        if (key === 'date' || key === 'completedAt') {
          return value ? new Date(value) : null;
        }
        if (key === 'timers') {
          return value?.map((timer: any) => ({
            ...timer,
            start: new Date(timer.start),
            end: timer.end ? new Date(timer.end) : null,
          }));
        }
        if (key === 'subTasks') {
          return value?.map((task: any) => ({
            ...task,
            completedAt: task.completedAt ? new Date(task.completedAt) : null,
          }));
        }
        return value;
      },
    });
  });
