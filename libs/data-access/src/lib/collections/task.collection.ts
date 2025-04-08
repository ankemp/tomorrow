import { isDevMode } from '@angular/core';
import angularReactivityAdapter from '@signaldb/angular';
import { Collection, createIndex } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import { addDays, endOfToday, startOfToday, startOfTomorrow } from 'date-fns';
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

const NOT_PINNED = [
  { pinned: false },
  { pinned: { $exists: false } },
  { pinned: null },
];

const INCLUDE_COMPLETED = (include: boolean) =>
  include
    ? { $or: [{ completedAt: null }, { completedAt: { $exists: false } }] }
    : { completedAt: null };

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
    const updatedSubTasks = [...task.subTasks];
    const currentSubtask = updatedSubTasks[subtaskIndex];

    if (currentSubtask.completedAt) {
      this.setSubtaskToIncomplete(task, subtaskIndex);
    } else {
      this.setSubtaskCompleted(task, subtaskIndex);
    }
  }

  setSubtaskToIncomplete(task: Task, subtaskIndex: number) {
    const updatedSubTasks = [...task.subTasks];
    updatedSubTasks[subtaskIndex] = {
      ...updatedSubTasks[subtaskIndex],
      completedAt: null,
    };
    this.updateOne(
      { id: task.id },
      {
        $set: {
          subTasks: updatedSubTasks,
        },
      },
    );
  }

  setSubtaskCompleted(task: Task, subtaskIndex: number) {
    const updatedSubTasks = [...task.subTasks];
    updatedSubTasks[subtaskIndex] = {
      ...updatedSubTasks[subtaskIndex],
      completedAt: new Date(),
    };
    this.updateOne(
      { id: task.id },
      {
        $set: {
          subTasks: updatedSubTasks,
        },
      },
    );
  }

  startTimer(task: Task) {
    this.updateOne(
      { id: task.id },
      {
        $set: {
          timers: [
            ...(task.timers || []),
            {
              start: new Date(),
              end: null,
            },
          ],
        },
      },
    );
  }

  stopTimer(task: Task, timerIndex: number) {
    const updatedTimers = [...task.timers];
    updatedTimers[timerIndex] = {
      ...updatedTimers[timerIndex],
      end: new Date(),
    };
    this.updateOne(
      { id: task.id },
      {
        $set: {
          timers: updatedTimers,
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
    const updatedTimers = [...task.timers];
    updatedTimers[timerIndex] = timer;
    this.updateOne(
      { id: task.id },
      {
        $set: {
          timers: updatedTimers,
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
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        completedAt: { $ne: null },
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getPinnedTasks(includeCompleted = true) {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        pinned: true,
        ...INCLUDE_COMPLETED(includeCompleted),
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
        $or: [...NOT_PINNED],
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
        $or: [...NOT_PINNED],
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getTodaysTasks({
    sort = TASK_SORT_DEFAULT,
    includeCompleted = true,
  }: { sort?: TaskSort; includeCompleted?: boolean } = {}) {
    const { field, order } = parseTaskSort(sort);
    return this.find(
      {
        date: { $gte: startOfToday(), $lt: endOfToday() },
        ...INCLUDE_COMPLETED(includeCompleted),
        $or: [...NOT_PINNED],
      },
      {
        sort: { [field]: order },
      },
    );
  }

  getUpcomingTasks({
    sort = TASK_SORT_DEFAULT,
    limit = 5,
  }: { sort?: TaskSort; limit?: number } = {}) {
    const { field, order } = parseTaskSort(sort);
    return this.find(
      {
        date: { $gt: startOfTomorrow() },
        $or: [...NOT_PINNED],
      },
      {
        sort: { [field]: order },
        ...(limit > 0 ? { limit } : {}),
      },
    );
  }

  getByCategory({
    category,
    includeCompleted = false,
  }: {
    category: string;
    includeCompleted?: boolean;
  }) {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        category,
        ...INCLUDE_COMPLETED(includeCompleted),
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
    // TODO: Handle attachments
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

  import(input: string): string[] {
    const csv = parse<Task>(input, {
      header: true,
      dynamicTyping: {
        pinned: true,
        date: true,
        completedAt: true,
        priority: true,
        duration: true,
      },
      transform: (value: string, field: string | number) => {
        if (field === 'id' && value.length === 0) {
          return undefined;
        }
        if (field === 'subTasks' && value) {
          const parsed = parse(
            value.startsWith('title,completedAt')
              ? value
              : `title,completedAt\n${value}`,
            {
              header: true,
              dynamicTyping: { completedAt: true },
            },
          );
          return parsed.data;
        }
        if (field === 'timers' && value) {
          const parsed = parse(
            value.startsWith('start,end') ? value : `start,end\n${value}`,
            {
              header: true,
              dynamicTyping: { start: true, end: true },
            },
          );
          return parsed.data;
        }
        if (field === 'timers' || (field === 'subTasks' && !value)) {
          return [];
        }
        if (field === 'attachments') {
          return [];
        }
        return value;
      },
    });
    const data = csv.data.map((task) => {
      if (!task.id) {
        const { id, ...rest } = task;
        return rest;
      }
      return task;
    });
    return this.insertMany(data);
  }
}

export const Tasks = new TaskCollection();
Tasks.setDebugMode(isDevMode());

function createRandomTask() {
  const randomTitle = `Task ${Math.floor(Math.random() * 1000)}`;
  const randomDate = addDays(new Date(), Math.floor(Math.random() * 8));
  const categories = ['Work', 'Personal', 'Health', 'Shopping'];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const randomPriority = [0, 1, 50, 99][Math.floor(Math.random() * 4)];
  const randomDuration = Math.floor(Math.random() * (1440 - 1) + 1);
  const userId = localStorage.getItem('settings')
    ? JSON.parse(localStorage.getItem('settings')!).userId
    : null;

  return {
    title: randomTitle,
    date: randomDate,
    category: randomCategory,
    completedAt: null,
    priority: randomPriority,
    ...(Math.random() < 0.5 ? { duration: randomDuration } : {}),
    userId,
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
