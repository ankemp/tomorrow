import { isDevMode } from '@angular/core';
import angularReactivityAdapter from '@signaldb/angular';
import { Collection, createIndex } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import { addDays, endOfToday, startOfToday, startOfTomorrow } from 'date-fns';
import { isNil } from 'es-toolkit';
import { parse, unparse } from 'papaparse';

import {
  SettingsState,
  Task,
  TASK_HEADERS,
  TASK_SORT_DEFAULT,
  TaskSort,
  TaskTimer,
} from '@tmrw/data-access-models';

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
  include ? {} : { completedAt: null };

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
    const updatedTimers = [...(task.timers ?? [])];
    const runningTimer = task.timers?.findIndex((t) => isNil(t.end));
    if (runningTimer > -1) {
      updatedTimers[runningTimer] = {
        ...updatedTimers[runningTimer],
        end: new Date(),
      };
    }
    this.updateOne(
      { id: task.id },
      {
        $set: {
          completedAt: task.completedAt ? null : new Date(),
          timers: updatedTimers,
        },
      },
    );
  }

  completeTask(task: Task, keepPinned = false) {
    const updatedTimers = [...(task.timers ?? [])];
    const runningTimer = task.timers?.findIndex((t) => isNil(t.end));
    if (runningTimer > -1) {
      updatedTimers[runningTimer] = {
        ...updatedTimers[runningTimer],
        end: new Date(),
      };
    }
    this.updateOne(
      { id: task.id },
      {
        $set: {
          completedAt: new Date(),
          pinned: keepPinned,
          timers: updatedTimers,
        },
      },
    );
  }

  toggleSubtask(task: Task, subtaskIndex: number) {
    const updatedSubTasks = [...(task.subTasks ?? [])];
    const currentSubtask = updatedSubTasks[subtaskIndex];

    if (currentSubtask.completedAt) {
      this.setSubtaskToIncomplete(task, subtaskIndex);
    } else {
      this.setSubtaskCompleted(task, subtaskIndex);
    }
  }

  setSubtaskToIncomplete(task: Task, subtaskIndex: number) {
    const updatedSubTasks = [...(task.subTasks ?? [])];
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
    const updatedSubTasks = [...(task.subTasks ?? [])];
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
            ...(task.timers ?? []),
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
    const updatedTimers = [...(task.timers ?? [])];
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
    const updatedTimers = [...(task.timers ?? [])];
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

  bulkTogglePinTasks(tasks: Task[]) {
    const ids = tasks.map((task) => task.id);
    const pinned = tasks.every((task) => task.pinned);
    this.updateMany(
      { id: { $in: ids } },
      {
        $set: {
          pinned: !pinned,
        },
      },
    );
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

  getTasksWithOngoingTimer() {
    const { field, order } = parseTaskSort(TASK_SORT_DEFAULT);
    return this.find(
      {
        timers: {
          $exists: true,
          $ne: [],
          $elemMatch: { start: { $exists: true }, end: null },
        },
        $or: [...NOT_PINNED],
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
    return this.updateMany({}, { $set: { userId } });
  }

  detachUserId() {
    return this.updateMany({}, { $unset: { userId: true } });
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
Tasks.on('validate', (task) => {
  if (!task.title) {
    throw new Error('Title is required');
  }
  if (!task.date) {
    throw new Error('Date is required');
  }
  if (!task.category) {
    throw new Error('Category is required');
  }
  if (task.timers?.some((t) => isNil(t.end))) {
    throw new Error('There can only be one ongoing timer');
  }
});
Tasks.setDebugMode(isDevMode());

function createRandomTask() {
  const settings: SettingsState = JSON.parse(
    localStorage.getItem('settings') ?? '',
  );
  const randomTitle = `Task ${Math.floor(Math.random() * 1000)}`;
  const randomDate = addDays(new Date(), Math.floor(Math.random() * 8));
  const categories = ['Work', 'Personal', 'Health', 'Shopping'];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const randomPriority = [0, 1, 50, 99][Math.floor(Math.random() * 4)];
  const randomDuration = Math.floor(Math.random() * (1440 - 1) + 1);
  const userId = settings && settings.remoteSync ? settings.userId : null;

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
    console.log('createRandomTask: ', tasks);
    Tasks.insertMany(tasks);
  };
}
