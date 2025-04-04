import { BaseModel } from './base.model';

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
