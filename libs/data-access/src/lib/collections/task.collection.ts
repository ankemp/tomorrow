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
      indices: [
        createIndex('title'),
        createIndex('date'),
        createIndex('description'),
      ],
    });
  }

  toggleTask(task: Task) {
    this.updateOne(
      { id: task.id },
      { $set: { completedAt: task.completedAt ? null : new Date() } },
    );
  }

  completeTask(task: Task, andUnpin = false) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          completedAt: new Date(),
          pinned: andUnpin ? false : task.pinned,
        },
      },
    );
  }

  toggleSubtask(task: Task, subtaskIndex: number) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          [`subTasks.${subtaskIndex}.completedAt`]: task.subTasks[subtaskIndex]
            .completedAt
            ? null
            : new Date(),
        },
      },
    );
  }

  completeSubtask(task: Task, subtaskIndex: number) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          [`subTasks.${subtaskIndex}.completedAt`]: new Date(),
        },
      },
    );
  }

  pinTask(task: Task) {
    this.updateOne({ id: task.id }, { $set: { pinned: !task.pinned } });
  }

  searchTasks(query: string) {
    return this.find(
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      },
      {
        sort: { date: 1 },
      },
    );
  }

  getTaskById(id: string) {
    return this.findOne({ id });
  }

  getCompletedTasks() {
    return this.find({
      completedAt: { $ne: null },
    });
  }

  getPinnedTasks(includeCompleted = true) {
    return this.find(
      {
        pinned: true,
        // FIXME: not working as expected
        // completedAt: includeCompleted ? { $ne: null } : null,
      },
      {
        sort: { date: 1 },
      },
    );
  }

  getOverdueTasks() {
    return this.find(
      {
        date: { $lt: startOfToday() },
        completedAt: null,
        pinned: false,
      },
      {
        sort: { date: 1 },
      },
    );
  }

  getTodaysIncompleteTasks() {
    return this.find(
      {
        date: { $gte: startOfToday(), $lt: endOfToday() },
        completedAt: null,
        pinned: false,
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
        pinned: false,
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
        pinned: false,
      },
      {
        sort: { date: 1 },
        limit: limit,
      },
    );
  }

  getByCategory(category: string, includeCompleted = false) {
    return this.find(
      {
        category,
        completedAt: includeCompleted ? { $ne: null } : null,
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
