import { BaseModel } from './base.model';

export interface Task extends BaseModel {
  title: string;
  date: Date;
  category: string;
  completedAt: Date | null;
  userId: string | null;
}
