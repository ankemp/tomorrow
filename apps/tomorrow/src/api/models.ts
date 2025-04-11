import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

import type { SubTask, Task, TaskTimer } from '@tmrw/data-access';

const isDevMode =
  !process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development';

const sequelize = new Sequelize({
  storage: process.env['DB_PATH'] || ':memory:',
  dialect: 'sqlite',
  logging: isDevMode ? console.log : false,
});

export const TASK_PROP_EXCLUDES = ['createdAt', 'updatedAt', 'deletedAt'];

export class PlainTask
  extends Model<InferAttributes<PlainTask>, InferCreationAttributes<PlainTask>>
  implements Task
{
  declare id: string;
  declare userId: string;
  declare title: string;
  declare date: Date;
  declare category: string;
  declare pinned: boolean;
  declare priority: CreationOptional<number>;
  declare description: CreationOptional<string>;
  declare location: CreationOptional<string>;
  declare duration: CreationOptional<number>;
  declare subTasks: CreationOptional<SubTask[]>;
  declare attachments: CreationOptional<string[]>;
  declare timers: CreationOptional<TaskTimer[]>;
  declare notes: CreationOptional<string>;
  declare completedAt: CreationOptional<Date>;
}

PlainTask.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE },
    category: { type: DataTypes.STRING },
    pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
    priority: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING },
    duration: { type: DataTypes.INTEGER },
    subTasks: { type: DataTypes.JSON },
    attachments: { type: DataTypes.JSON },
    timers: { type: DataTypes.JSON },
    notes: { type: DataTypes.TEXT },
    completedAt: { type: DataTypes.DATE },
  },
  {
    sequelize,
    paranoid: true,
  },
);

export class EncryptedTask extends Model<
  InferAttributes<EncryptedTask>,
  InferCreationAttributes<EncryptedTask>
> {
  declare id: string;
  declare userId: string;
  declare encryptedData: string;
}

EncryptedTask.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING },
    encryptedData: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    paranoid: true,
  },
);

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: string;
  declare syncDevices: string[];
  // declare theme: string;
  declare defaultReminderTime: string;
  declare defaultReminderCategory: string;
  declare startOfWeek: string;
  declare timeFormat: string;
  declare autoCompleteTasks: 'always' | 'never' | 'ask';
  declare locale: string;
}

User.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    syncDevices: { type: DataTypes.JSON },
    // theme: { type: DataTypes.STRING },
    defaultReminderTime: { type: DataTypes.STRING },
    defaultReminderCategory: { type: DataTypes.STRING },
    startOfWeek: { type: DataTypes.STRING },
    timeFormat: { type: DataTypes.STRING },
    autoCompleteTasks: {
      type: DataTypes.STRING,
      validate: { isIn: [['always', 'never', 'ask']] },
    },
    locale: { type: DataTypes.STRING },
  },
  {
    sequelize,
    paranoid: true,
  },
);

// Synchronize models
(async () => {
  await PlainTask.sync();
  await EncryptedTask.sync();
  await User.sync();
})();

export { sequelize };
