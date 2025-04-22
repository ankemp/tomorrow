import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

import type { SubTask, Task, TaskTimer } from '@tmrw/data-access';

@Table({ tableName: 'PlainTasks' })
export class PlainTask
  extends Model<InferAttributes<PlainTask>, InferCreationAttributes<PlainTask>>
  implements Task
{
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  category: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  pinned: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  priority: CreationOptional<number>;

  @Column({
    type: DataType.TEXT,
  })
  description: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
  })
  location: CreationOptional<string>;

  @Column({
    type: DataType.INTEGER,
  })
  duration: CreationOptional<number>;

  @Column({
    type: DataType.JSON,
  })
  subTasks: CreationOptional<SubTask[]>;

  @Column({
    type: DataType.JSON,
  })
  attachments: CreationOptional<string[]>;

  @Column({
    type: DataType.JSON,
  })
  timers: CreationOptional<TaskTimer[]>;

  @Column({
    type: DataType.TEXT,
  })
  notes: CreationOptional<string>;

  @Column({
    type: DataType.DATE,
  })
  completedAt: CreationOptional<Date>;
}

export const PLAIN_TASK = 'PLAIN_TASK_REPOSITORY';
export const plainTaskProvider = {
  provide: PLAIN_TASK,
  useValue: PlainTask,
};
