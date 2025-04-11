import { Changeset } from '@signaldb/core/index';
import express from 'express';
import { Op } from 'sequelize';

import { Task } from '@tmrw/data-access';

import {
  addSseClient,
  dispatchServerSideEvent,
  removeSseClient,
} from './helpers';
import { EncryptedTask, PlainTask, TASK_PROP_EXCLUDES, User } from './models';

const apiRouter = express.Router();

type TaskEndpointBody =
  | {
      changes: { id: string; content: Task }[];
      encrypted: false;
      userId: string;
      deviceId: string;
    }
  | {
      changes: Array<{ id: string; content: string }>;
      encrypted: true;
      userId: string;
      deviceId: string;
    };

// SSE endpoint
apiRouter.get('/tasks/events/user/:userId', (req, res) => {
  const { userId } = req.params;
  const deviceId = req.query['deviceId'] as string;
  if (!userId || !deviceId) {
    res.status(400);
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  addSseClient(userId, deviceId, res);

  req.on('close', () => {
    removeSseClient(userId, deviceId);
  });
});

// Task routes
apiRouter.post('/tasks', async (req, res) => {
  const { changes, encrypted, userId, deviceId } = req.body as TaskEndpointBody;

  if (!userId || !deviceId) {
    res.sendStatus(400);
  }

  // TODO: check if deviceID is in syncDevices

  if (encrypted) {
    await EncryptedTask.bulkCreate(
      changes.map((change) => {
        return {
          id: change.id,
          userId: userId,
          encryptedData: change.content,
        };
      }),
    );
  } else {
    await PlainTask.bulkCreate(changes.map((change) => change.content as any));
  }

  if (userId && deviceId) {
    dispatchServerSideEvent<Changeset<any>>(userId, deviceId, 'task', {
      added: changes.map((change) => change.content),
      modified: [],
      removed: [],
    });
  }

  res.sendStatus(201);
});

apiRouter.put('/tasks', async (req, res) => {
  const { changes, encrypted, userId, deviceId } = req.body as TaskEndpointBody;

  if (!userId || !deviceId) {
    res.sendStatus(400);
  }

  // TODO: check if deviceID is in syncDevices

  if (encrypted) {
    for (const change of changes) {
      await EncryptedTask.update(
        { encryptedData: change.content },
        { where: { id: change.id } },
      );
    }
  } else {
    for (const change of changes) {
      await PlainTask.update(change.content as any, {
        where: { id: change.id },
      });
    }
  }

  if (userId && deviceId) {
    dispatchServerSideEvent<Changeset<any>>(userId, deviceId, 'task', {
      added: [],
      modified: changes.map((change) => change.content),
      removed: [],
    });
  }

  res.sendStatus(200);
});

apiRouter.delete('/tasks', async (req, res) => {
  const { changes, encrypted, userId, deviceId } = req.body as TaskEndpointBody;

  if (!userId || !deviceId) {
    res.sendStatus(400);
  }

  // TODO: check if deviceID is in syncDevices

  const ids = changes.map((change) => change.id);
  if (encrypted) {
    await EncryptedTask.destroy({ where: { id: ids } });
  } else {
    await PlainTask.destroy({ where: { id: ids } });
  }

  if (userId && deviceId) {
    dispatchServerSideEvent<Changeset<any>>(userId, deviceId, 'task', {
      added: [],
      modified: [],
      removed: changes.map((change) => change.content),
    });
  }

  res.sendStatus(200);
});

apiRouter.get('/tasks', async (req, res) => {
  const lastFinishedSyncStart = req.query['since'] as string;
  const userId = req.query['userId'] as string;
  const deviceId = req.query['deviceId'] as string;

  if (!userId || !deviceId) {
    res.sendStatus(400);
  }

  // TODO: check if deviceID is in syncDevices

  const utcLastFinishedSyncStart = lastFinishedSyncStart
    ? new Date(+lastFinishedSyncStart)
    : new Date(0);

  const whereAdded = {
    userId,
    createdAt: { [Op.gte]: utcLastFinishedSyncStart },
  };

  const whereModified = {
    userId,
    updatedAt: { [Op.gte]: utcLastFinishedSyncStart },
    createdAt: { [Op.lt]: utcLastFinishedSyncStart },
  };

  const whereRemoved = {
    userId,
    deletedAt: { [Op.gte]: utcLastFinishedSyncStart },
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
    res.sendStatus(500);
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
  await User.findOrBuild({ where: { id: userId } })
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
      res.sendStatus(200);
    });
});

apiRouter.delete('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  await User.destroy({ where: { id: userId } });
  // TODO: Add SSE signal(?)
  res.sendStatus(200);
});

export { apiRouter };
