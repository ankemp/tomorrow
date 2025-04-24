import { Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import type { Task } from '@tmrw/data-access-models';

import { ENCRYPTED_TASK, EncryptedTask } from '../_db/encrypted_task.entity';
import { PLAIN_TASK, PlainTask } from '../_db/plain_task.entity';

const TASK_PROP_EXCLUDES = ['createdAt', 'updatedAt', 'deletedAt'];

export type TaskEndpointBody =
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

@Injectable()
export class TasksService {
  constructor(
    @Inject(PLAIN_TASK) private readonly plainTaskRepository: typeof PlainTask,
    @Inject(ENCRYPTED_TASK)
    private readonly encryptedTaskRepository: typeof EncryptedTask,
  ) {}

  async createTasks(body: TaskEndpointBody) {
    const { changes, encrypted, userId, deviceId } = body;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    if (encrypted) {
      await this.encryptedTaskRepository.bulkCreate(
        changes.map((change: any) => ({
          id: change.id,
          userId: userId,
          encryptedData: change.content,
        })),
      );
    } else {
      await this.plainTaskRepository.bulkCreate(
        changes.map((change: any) => change.content),
      );
    }

    return {
      added: changes.map((change: any) => change.content),
      modified: [],
      removed: [],
    };
  }

  async updateTasks(body: TaskEndpointBody) {
    const { changes, encrypted, userId, deviceId } = body;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    if (encrypted) {
      for (const change of changes) {
        await this.encryptedTaskRepository.update(
          { encryptedData: change.content },
          { where: { id: change.id } },
        );
      }
    } else {
      for (const change of changes) {
        await this.plainTaskRepository.update(change.content as Task, {
          where: { id: change.id },
        });
      }
    }

    return {
      added: [],
      modified: changes.map((change: any) => change.content),
      removed: [],
    };
  }

  async deleteTasks(body: TaskEndpointBody) {
    const { changes, encrypted, userId, deviceId } = body;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    const ids = changes.map((change: any) => change.id);
    if (encrypted) {
      await this.encryptedTaskRepository.destroy({ where: { id: ids } });
    } else {
      await this.plainTaskRepository.destroy({ where: { id: ids } });
    }

    return {
      added: [],
      modified: [],
      removed: changes.map((change: any) => change.content),
    };
  }

  async getTasks(query: {
    since?: number;
    userId: string;
    deviceId: string;
    encrypted: boolean;
  }) {
    console.log('getTasks', query);
    const { since, userId, deviceId, encrypted } = query;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    const utcLastFinishedSyncStart = since ? new Date(since) : new Date(0);

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

    const added = encrypted
      ? await this.encryptedTaskRepository.findAll({
          attributes: { exclude: TASK_PROP_EXCLUDES },
          where: whereAdded,
        })
      : await this.plainTaskRepository.findAll({
          attributes: { exclude: TASK_PROP_EXCLUDES },
          where: whereAdded,
        });

    const modified = encrypted
      ? await this.encryptedTaskRepository.findAll({
          attributes: { exclude: TASK_PROP_EXCLUDES },
          where: whereModified,
        })
      : await this.plainTaskRepository.findAll({
          attributes: { exclude: TASK_PROP_EXCLUDES },
          where: whereModified,
        });

    const removed = encrypted
      ? await this.encryptedTaskRepository.findAll({
          attributes: { exclude: TASK_PROP_EXCLUDES },
          where: whereRemoved,
          paranoid: false,
        })
      : await this.plainTaskRepository.findAll({
          attributes: { exclude: TASK_PROP_EXCLUDES },
          where: whereRemoved,
          paranoid: false,
        });

    return { added, modified, removed };
  }

  async deleteUserTasks(userId: string) {
    await this.plainTaskRepository.destroy({ where: { userId }, force: true });
  }
}
