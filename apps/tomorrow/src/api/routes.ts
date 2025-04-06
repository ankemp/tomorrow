import express from 'express';
import { Op } from 'sequelize';

import { Task } from '@tmrw/data-access';

import {
  addSseClient,
  dispatchSignalDBChange,
  removeSseClient,
} from './helpers';
import { EncryptedTask, PlainTask, TASK_PROP_EXCLUDES, User } from './models';

const apiRouter = express.Router();

// SSE endpoint
apiRouter.get('/tasks/events/user/:userId', (req, res) => {
  const { userId } = req.params;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  addSseClient(userId, res);

  req.on('close', () => {
    removeSseClient(userId, res);
  });
});

// Task routes
apiRouter.post('/tasks', async (req, res) => {
  if (req.body.encrypted) {
    await EncryptedTask.create({
      id: req.body.id,
      encryptedData: req.body.content,
    });
  } else {
    await PlainTask.create(req.body.content);
  }
  const userId = req.body.content?.userId || req.body.userId;
  if (userId) {
    dispatchSignalDBChange<Task>(userId, 'task-updated', {
      added: [req.body.content],
      modified: [],
      removed: [],
    });
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
  const userId = req.body.content?.userId || req.body.userId;
  if (userId) {
    dispatchSignalDBChange(userId, 'task-updated', {
      added: [],
      modified: [req.body.content],
      removed: [],
    });
  }
  res.sendStatus(200);
});

apiRouter.delete('/tasks', async (req, res) => {
  if (req.body?.encrypted) {
    await EncryptedTask.destroy({ where: { id: req.body.id } });
  } else {
    await PlainTask.destroy({ where: { id: req.body.id } });
  }
  const userId = req.body.userId;
  if (userId) {
    dispatchSignalDBChange<Task>(userId, 'task-updated', {
      added: [],
      modified: [],
      removed: [req.body.content],
    });
  }
  res.sendStatus(200);
});

apiRouter.get('/tasks/user/:userId', async (req, res) => {
  const lastFinishedSyncStart = +(req.query['since'] as string);
  const userId = req.params.userId;

  const utcLastFinishedSyncStart = new Date(lastFinishedSyncStart);

  const whereAdded = {
    userId,
    createdAt: lastFinishedSyncStart
      ? { [Op.gte]: utcLastFinishedSyncStart }
      : undefined,
  };

  const whereModified = {
    userId,
    updatedAt: lastFinishedSyncStart
      ? { [Op.gte]: utcLastFinishedSyncStart }
      : undefined,
    createdAt: lastFinishedSyncStart
      ? { [Op.lt]: utcLastFinishedSyncStart }
      : undefined,
  };

  const whereRemoved = {
    userId,
    deletedAt: lastFinishedSyncStart
      ? { [Op.gte]: utcLastFinishedSyncStart }
      : undefined,
  };

  try {
    const added =
      req.query['encrypted'] === 'true'
        ? await EncryptedTask.findAll({
            attributes: { exclude: TASK_PROP_EXCLUDES },
            where: whereAdded,
          })
        : await PlainTask.findAll({
            attributes: { exclude: TASK_PROP_EXCLUDES },
            where: whereAdded,
          });

    const modified =
      req.query['encrypted'] === 'true'
        ? await EncryptedTask.findAll({
            attributes: { exclude: TASK_PROP_EXCLUDES },
            where: whereModified,
          })
        : await PlainTask.findAll({
            attributes: { exclude: TASK_PROP_EXCLUDES },
            where: whereModified,
          });

    const removed =
      req.query['encrypted'] === 'true'
        ? await EncryptedTask.findAll({
            attributes: { exclude: TASK_PROP_EXCLUDES },
            where: whereRemoved,
          })
        : await PlainTask.findAll({
            attributes: { exclude: TASK_PROP_EXCLUDES },
            where: whereRemoved,
          });

    res.json({ added, modified, removed });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch changeset', details: error });
  }
});

apiRouter.delete('/tasks/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  await PlainTask.destroy({ where: { userId }, force: true });
  res.sendStatus(200);
});

// User routes
apiRouter.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  User.findOne({
    attributes: { exclude: TASK_PROP_EXCLUDES },
    where: { id: userId },
  }).then((user) => res.json(user));
});

apiRouter.post('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const settings = req.body;
  User.findOrBuild({ where: { id: userId } })
    .then(([user]) => {
      for (const key in settings) {
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
      // TODO: Add SSE signal(?)
      res.status(200).json({ success: true });
    });
});

apiRouter.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  await User.destroy({ where: { id: userId } });
  // TODO: Add SSE signal(?)
  res.sendStatus(200);
});

export { apiRouter };
