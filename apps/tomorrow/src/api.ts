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

export class SqTask
  extends Model<InferAttributes<SqTask>, InferCreationAttributes<SqTask>>
  implements Task
{
  declare id: string;
  declare title: string;
  declare date: Date;
  declare category: string;
  declare completedAt: CreationOptional<Date>;
}

SqTask.init(
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

await SqTask.sync();

apiRouter.post('/tasks', async (req, res) => {
  console.log(req.body);
  await SqTask.create(req.body);
  res.sendStatus(200);
});

apiRouter.put('/tasks', async (req, res) => {
  await SqTask.update(req.body, { where: { id: req.body.id } });
  res.sendStatus(200);
});

apiRouter.delete('/tasks', async (req, res) => {
  await SqTask.destroy({ where: { id: req.body.id } });
  res.sendStatus(200);
});

apiRouter.get('/tasks', (req, res) => {
  // TODO: figure out how to use lastFinishedSyncStart here instead of just sending all
  SqTask.findAll().then((tasks) => res.json(tasks));
});

export { apiRouter };
