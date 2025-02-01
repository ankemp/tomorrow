import angularReactivityAdapter from '@signaldb/angular';
import { Collection, createIndex } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import { endOfToday, startOfToday, startOfTomorrow } from 'date-fns';

import { Task } from '../models/task.model';
import { syncManager } from '../sync-manager';

class TaskCollection extends Collection<Task> {
  constructor() {
    super({
      name: 'task',
      reactivity: angularReactivityAdapter,
      persistence: createIndexedDBAdapter('tasks'),
      indices: [createIndex('title'), createIndex('date')],
    });
  }

  toggleTask(task: Task) {
    this.updateOne(
      { id: task.id },
      { $set: { completedAt: task.completedAt ? null : new Date() } },
    );
  }

  getOverdueTasks() {
    return this.find(
      {
        date: { $lt: startOfToday() },
        completedAt: null,
      },
      {
        sort: { date: 1 },
      },
    );
  }

  getTodaysTasks() {
    return this.find(
      {
        date: { $gte: startOfToday(), $lt: endOfToday() },
      },
      {
        sort: { date: 1 },
      },
    );
  }

  getUpcomingTasks(limit = 5) {
    return this.find(
      {
        date: { $gt: startOfTomorrow() },
      },
      {
        sort: { date: 1 },
        limit: limit,
      },
    );
  }

  getByCategory(category: string) {
    return this.find(
      {
        category,
      },
      {
        sort: { date: 1 },
      },
    );
  }

  attachUserId(userId: string) {
    this.updateMany({}, { $set: { userId } });
  }

  detachUserId() {
    this.updateMany({}, { $unset: { userId: '' } });
  }
}

export const Tasks = new TaskCollection();

syncManager.addCollection(Tasks, {
  name: 'tasks',
  apiPath: '/api/tasks',
});
