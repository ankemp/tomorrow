import angularReactivityAdapter from '@signaldb/angular';
import { Collection } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';

import { Task } from '../models/task.model';

class TaskCollection extends Collection<Task> {
  constructor() {
    super({
      name: 'task',
      reactivity: angularReactivityAdapter,
      persistence: createIndexedDBAdapter('tasks'),
    });
  }

  toggleTask(task: Task) {
    this.updateOne(
      { id: task.id },
      { $set: { completedAt: task.completedAt ? null : new Date() } },
    );
  }
}

export const Tasks = new TaskCollection();
