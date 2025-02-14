import express from 'express';

import { addSseClient, notifyUser, removeSseClient } from './helpers';
import { EncryptedTask, PlainTask, User } from './models';

const apiRouter = express.Router();

// SSE endpoint
apiRouter.get('/events/user/:userId', (req, res) => {
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
  if (userId)
    notifyUser(userId, 'task-updated', { action: 'created', id: req.body.id });
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
  if (userId)
    notifyUser(userId, 'task-updated', { action: 'updated', id: req.body.id });
  res.sendStatus(200);
});

apiRouter.delete('/tasks', async (req, res) => {
  if (req.body?.encrypted) {
    await EncryptedTask.destroy({ where: { id: req.body.id } });
  } else {
    await PlainTask.destroy({ where: { id: req.body.id } });
  }
  const userId = req.body.userId;
  if (userId)
    notifyUser(userId, 'task-updated', { action: 'deleted', id: req.body.id });
  res.sendStatus(200);
});

apiRouter.get('/tasks/user/:userId', (req, res) => {
  const exclude = ['createdAt', 'updatedAt', 'deletedAt'];
  const lastFinishedSyncStart = req.query['since'];
  const whereClause = {
    userId: req.params.userId,
    updatedAt: lastFinishedSyncStart
      ? { $gte: new Date(lastFinishedSyncStart as string) }
      : undefined,
  };

  if (req.query['encrypted'] === 'true') {
    EncryptedTask.findAll({ attributes: { exclude }, where: whereClause }).then(
      (tasks) => res.json(tasks),
    );
  } else {
    PlainTask.findAll({ attributes: { exclude }, where: whereClause }).then(
      (tasks) => res.json(tasks),
    );
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
      notifyUser(userId, 'user-updated', { updated: true });
      res.status(200).json({ success: true });
    });
});

apiRouter.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  await User.destroy({ where: { id: userId } });
  notifyUser(userId, 'user-updated', { deleted: true });
  res.sendStatus(200);
});

export { apiRouter };
