import { BaseModel } from './base.model';

export const TASK_SSE_EVENT = 'tasks';

export type TaskSort =
  | 'date_desc'
  | 'date_asc'
  | 'priority_desc'
  | 'priority_asc';
export const TASK_SORT_DEFAULT: TaskSort = 'date_asc';

export interface SubTask {
  title: string;
  completedAt: Date | null;
}

export interface TaskTimer {
  start: Date;
  end: Date | null;
}

export const TASK_HEADERS = Object.keys({
  id: '',
  title: '',
  date: new Date(),
  reminder: false,
  category: '',
  priority: null,
  description: null,
  pinned: false,
  completedAt: new Date(),
  location: null,
  duration: null,
  subTasks: [],
  attachments: [],
  timers: [],
  notes: null,
  userId: null,
} satisfies Task);
export interface Task extends BaseModel {
  title: string;
  date: Date;
  reminder: boolean;
  category: string;
  priority: number | null;
  description: string | null;
  pinned: boolean;
  completedAt: Date | null;
  location: string | null;
  duration: number | null;
  subTasks: SubTask[];
  attachments: string[];
  timers: TaskTimer[];
  notes: string | null;
  userId: string | null;
}

export interface EncryptedTask {
  id: string;
  encryptedData: string;
  userId: string;
  date: Date;
}

export interface TaskChange<T> {
  id: string;
  date: Date;
  content: T;
}

export type TasksChangePayload =
  | {
      changes: Array<TaskChange<Task>>;
      encrypted: false;
      userId: string;
      deviceId: string;
    }
  | {
      changes: Array<TaskChange<string>>;
      encrypted: true;
      userId: string;
      deviceId: string;
    };
