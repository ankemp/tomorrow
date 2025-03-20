import { isDevMode } from '@angular/core';
import angularReactivityAdapter from '@signaldb/angular';
import { Collection, createIndex } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import { endOfToday, startOfToday, startOfTomorrow } from 'date-fns';
import { isNil } from 'es-toolkit';
import { parse, unparse } from 'papaparse';

import { Task, TASK_HEADERS, TaskTimer } from '../models/task.model';
import { syncManager } from '../sync-manager';

export type TaskSort =
  | 'date_desc'
  | 'date_asc'
  | 'priority_desc'
  | 'priority_asc';
export const TASK_SORT_DEFAULT: TaskSort = 'date_asc';

export function parseTaskSort(sort: TaskSort): {
  field: string;
  order: 1 | -1;
} {
  const [field, order] = sort.split('_');
  return { field, order: order === 'asc' ? 1 : -1 };
}

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

  startTimer(task: Task) {
    this.updateOne(
      { id: task.id },
      {
        $push: {
          timers: {
            start: new Date(),
            end: null,
          },
        },
      },
    );
  }

  stopTimer(task: Task, timerIndex: number) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          [`timers.${timerIndex}.end`]: new Date(),
        },
      },
    );
  }

  toggleTimer(task: Task) {
    if (!Array.isArray(task.timers)) {
      this.startTimer(task);
    } else {
      const incompleteTimerIndex = task.timers.findIndex((t) => isNil(t.end));
      if (incompleteTimerIndex > -1) {
        this.stopTimer(task, incompleteTimerIndex);
      } else {
        this.startTimer(task);
      }
    }
  }

  updateTimer(task: Task, timerIndex: number, timer: TaskTimer) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          [`timers.${timerIndex}`]: timer,
        },
      },
    );
  }

  removeTimer(task: Task, timerIndex: number) {
    this.updateOne(
      { id: task.id },
      {
        $pull: {
          timers: task.timers[timerIndex],
        },
      },
    );
  }

  toggleTaskPin(task: Task) {
    this.updateOne({ id: task.id }, { $set: { pinned: !task.pinned } });
  }

  updateDate(task: Task, date: Date) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          date: date,
        },
      },
    );
  }

  searchTasks(query: string) {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      },
      {
        sort: { [field]: order },
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
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        pinned: true,
        // FIXME: not working as expected
        // completedAt: includeCompleted ? { $ne: null } : null,
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getOverdueTasks() {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        date: { $lt: startOfToday() },
        completedAt: null,
        $or: [{ pinned: false }, { pinned: { $exists: false } }],
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getTodaysIncompleteTasks() {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        date: { $gte: startOfToday(), $lt: endOfToday() },
        completedAt: null,
        $or: [{ pinned: false }, { pinned: { $exists: false } }],
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getTodaysTasks(sort: TaskSort) {
    const { field, order } = parseTaskSort(sort);
    return this.find(
      {
        date: { $gte: startOfToday(), $lt: endOfToday() },
        $or: [{ pinned: false }, { pinned: { $exists: false } }],
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getUpcomingTasks(sort: TaskSort, limit = 5) {
    const { field, order } = parseTaskSort(sort);
    return this.find(
      {
        date: { $gt: startOfTomorrow() },
        $or: [{ pinned: false }, { pinned: { $exists: false } }],
      },
      {
        sort: { [field]: order },
        limit: limit,
      },
    );
  }

  getByCategory(category: string, includeCompleted = false) {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        category,
        completedAt: includeCompleted ? { $ne: null } : null,
      },
      {
        sort: { [field]: order },
      },
    );
  }

  attachUserId(userId: string) {
    return this.updateMany(
      {
        userId: { $exists: false },
      },
      { $set: { userId } },
    );
  }

  detachUserId() {
    return this.updateMany(
      {
        userId: { $exists: true },
      },
      { $unset: { userId: '' } },
    );
  }

  exportAll(): string {
    const tasks = this.find();
    const data = tasks.fetch();
    const csv = unparse(
      data.map((task) => {
        return {
          ...task,
          subTasks: task.subTasks
            ? unparse(task.subTasks, {
                header: true,
                columns: ['title', 'completedAt'],
              })
            : undefined,
          timers: task.timers
            ? unparse(task.timers, { header: true, columns: ['start', 'end'] })
            : undefined,
        };
      }),
      { header: true, columns: TASK_HEADERS },
    );
    return csv;
  }

  import(csv: string): string[] {
    const tasks = parse<Task>(csv, {
      header: true,
      dynamicTyping: {
        pinned: true,
        date: true,
        completedAt: true,
        priority: true,
        duration: true,
      },
      transform: (value: string, field: string | number) => {
        if (field === 'subTasks' && value) {
          return parse(value, {
            header: true,
            dynamicTyping: { completedAt: true },
          }).data;
        }
        if (field === 'timers' && value) {
          return parse(value, {
            header: true,
            dynamicTyping: { start: true, end: true },
          }).data;
        }
        return value;
      },
    });
    const data = tasks.data.map(({ id, ...task }) => task);
    return this.insertMany(data);
  }
}

export const Tasks = new TaskCollection();

function createRandomTask() {
  const randomTitle = `Task ${Math.floor(Math.random() * 1000)}`;
  const randomDate = new Date(
    Date.now() + Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000,
  );
  const categories = ['Work', 'Personal', 'Health', 'Shopping'];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const randomPriority = [0, 1, 50, 99][Math.floor(Math.random() * 4)];
  const randomDuration = Math.floor(Math.random() * (1440 - 1) + 1);

  return {
    title: randomTitle,
    date: randomDate,
    category: randomCategory,
    completedAt: null,
    priority: randomPriority,
    ...(Math.random() < 0.5 ? { duration: randomDuration } : {}),
  } satisfies Partial<Task>;
}

if (isDevMode() && typeof window !== 'undefined') {
  (window as any).createRandomTasks = (count: number) => {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push(createRandomTask());
    }
    console.log('inserting tasks', tasks);
    Tasks.insertMany(tasks);
  };
}

syncManager.addCollection(Tasks, {
  name: 'tasks',
  apiPath: '/api/tasks',
});
