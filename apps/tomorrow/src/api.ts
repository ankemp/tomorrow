import express from 'express';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

import type { SubTask, Task } from '@tmrw/data-access';

const apiRouter = express.Router();
const sequelize = new Sequelize({
  storage: process.env['DB_PATH'] || ':memory:',
  dialect: 'sqlite',
});

export class PlainTask
  extends Model<InferAttributes<PlainTask>, InferCreationAttributes<PlainTask>>
  implements Task
{
  declare id: string;
  declare title: string;
  declare date: Date;
  declare category: string;
  declare description: CreationOptional<string>;
  declare location: CreationOptional<string>;
  declare duration: CreationOptional<number>;
  declare subTasks: CreationOptional<SubTask[]>;
  declare attachments: CreationOptional<string[]>;
  declare notes: CreationOptional<string>;
  declare completedAt: CreationOptional<Date>;
  declare userId: CreationOptional<string>;
}

PlainTask.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE },
    category: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING },
    duration: { type: DataTypes.INTEGER },
    subTasks: { type: DataTypes.JSON },
    attachments: { type: DataTypes.JSON },
    notes: { type: DataTypes.TEXT },
    completedAt: { type: DataTypes.DATE },
    userId: { type: DataTypes.STRING },
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
  declare encryptedData: string;
}

EncryptedTask.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
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
  declare locale: string;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    syncDevices: {
      type: DataTypes.JSON,
    },
    // theme: {
    //   type: DataTypes.STRING,
    // },
    defaultReminderTime: { type: DataTypes.STRING },
    defaultReminderCategory: { type: DataTypes.STRING },
    startOfWeek: { type: DataTypes.STRING },
    timeFormat: { type: DataTypes.STRING },
    locale: { type: DataTypes.STRING },
  },
  {
    sequelize,
    paranoid: true,
  },
);

await PlainTask.sync();
await EncryptedTask.sync();
await User.sync();

apiRouter.post('/tasks', async (req, res) => {
  if (req.body.encrypted) {
    await EncryptedTask.create({
      id: req.body.id,
      encryptedData: req.body.content,
    });
  } else {
    await PlainTask.create(req.body.content);
  }
  res.sendStatus(200);
});

apiRouter.put('/tasks', async (req, res) => {
  if (req.body?.encrypted) {
    await EncryptedTask.update(
      { encryptedData: req.body.content },
      { where: { id: req.body.id } },
    );
  } else {
    await PlainTask.update(req.body.content, { where: { id: req.body.id } });
  }
  res.sendStatus(200);
});

apiRouter.delete('/tasks', async (req, res) => {
  if (req.body?.encrypted) {
    await EncryptedTask.destroy({ where: { id: req.body.id } });
  } else {
    await PlainTask.destroy({ where: { id: req.body.id } });
  }
  res.sendStatus(200);
});

apiRouter.get('/tasks/user/:userId', (req, res) => {
  // TODO: figure out how to use lastFinishedSyncStart here instead of just sending all
  const exclude = ['createdAt', 'updatedAt', 'deletedAt'];
  if (req.query['encrypted'] === 'true') {
    EncryptedTask.findAll({
      attributes: { exclude },
    }).then((tasks) => res.json(tasks));
  } else {
    PlainTask.findAll({
      attributes: { exclude },
    }).then((tasks) => res.json(tasks));
  }
});

apiRouter.delete('/tasks/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  await PlainTask.destroy({ where: { userId }, force: true });
  res.sendStatus(200);
});

apiRouter.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const exclude = ['createdAt', 'updatedAt', 'deletedAt'];
  User.findOne({
    attributes: { exclude },
    where: { id: userId },
  }).then((user) => res.json(user));
});

apiRouter.post('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const settings = req.body;
  User.findOrBuild({ where: { id: userId } })
    .then(([user]) => {
      for (const key in settings) {
        // TODO: Fix this any
        if (key === 'syncDevices') {
          user.set('syncDevices', {
            ...(user.get('syncDevices') ?? {}),
            ...settings.syncDevices,
          });
        } else {
          user.set(key as any, settings[key]);
        }
      }
      return user.save();
    })
    .finally(() => {
      res.status(200).json({ success: true });
    });
});

apiRouter.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  await User.destroy({ where: { id: userId } });
  res.sendStatus(200);
});

export { apiRouter };
