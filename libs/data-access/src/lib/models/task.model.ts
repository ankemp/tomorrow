import { BaseModel } from './base.model';

export interface SubTask {
  title: string;
  completedAt: Date | null;
}

export interface Task extends BaseModel {
  title: string;
  date: Date;
  category: string;
  description: string | null;
  pinned: boolean;
  completedAt: Date | null;
  location: string | null;
  duration: number | null;
  subTasks: SubTask[];
  attachments: string[];
  notes: string | null;
  userId: string | null;
}
