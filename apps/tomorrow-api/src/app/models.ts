import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Table, Column, DataType, Model } from 'sequelize-typescript';
import type { SubTask, Task, TaskTimer } from '@tmrw/data-access';

@Table({ tableName: 'plain_tasks' })
export class PlainTask extends Model<InferAttributes<PlainTask>, InferCreationAttributes<PlainTask>> implements Task {
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

@Table({ tableName: 'encrypted_tasks' })
export class EncryptedTask extends Model<InferAttributes<EncryptedTask>, InferCreationAttributes<EncryptedTask>> {
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
    type: DataType.TEXT,
    allowNull: false,
  })
  encryptedData: string;
}

@Table({ tableName: 'users' })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.JSON,
  })
  syncDevices: string[];

  @Column({
    type: DataType.STRING,
  })
  defaultReminderTime: string;

  @Column({
    type: DataType.STRING,
  })
  defaultReminderCategory: string;

  @Column({
    type: DataType.STRING,
  })
  startOfWeek: string;

  @Column({
    type: DataType.STRING,
  })
  timeFormat: string;

  @Column({
    type: DataType.STRING,
    validate: { isIn: [['always', 'never', 'ask']] },
  })
  autoCompleteTasks: 'always' | 'never' | 'ask';

  @Column({
    type: DataType.STRING,
  })
  locale: string;
}