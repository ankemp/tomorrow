import express from 'express';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

import type { Task } from '@tmrw/data-access';

const apiRouter = express.Router();
const sequelize = new Sequelize('sqlite::memory:', { dialect: 'sqlite' });

export class PlainTask
  extends Model<InferAttributes<PlainTask>, InferCreationAttributes<PlainTask>>
  implements Task
{
  declare id: string;
  declare title: string;
  declare date: Date;
  declare category: string;
  declare completedAt: CreationOptional<Date>;
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

await PlainTask.sync();
await EncryptedTask.sync();

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

apiRouter.get('/tasks', (req, res) => {
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

export { apiRouter };
