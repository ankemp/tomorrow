import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PlainTask, EncryptedTask } from '../models';
import { Op } from 'sequelize';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(PlainTask) private readonly plainTaskModel: typeof PlainTask,
    @InjectModel(EncryptedTask) private readonly encryptedTaskModel: typeof EncryptedTask,
  ) {}

  async createTasks(body: any) {
    const { changes, encrypted, userId, deviceId } = body;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    if (encrypted) {
      await this.encryptedTaskModel.bulkCreate(
        changes.map((change: any) => ({
          id: change.id,
          userId: userId,
          encryptedData: change.content,
        })),
      );
    } else {
      await this.plainTaskModel.bulkCreate(changes.map((change: any) => change.content));
    }

    return {
      added: changes.map((change: any) => change.content),
      modified: [],
      removed: [],
    };
  }

  async updateTasks(body: any) {
    const { changes, encrypted, userId, deviceId } = body;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    if (encrypted) {
      for (const change of changes) {
        await this.encryptedTaskModel.update(
          { encryptedData: change.content },
          { where: { id: change.id } },
        );
      }
    } else {
      for (const change of changes) {
        await this.plainTaskModel.update(change.content, {
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

  async deleteTasks(body: any) {
    const { changes, encrypted, userId, deviceId } = body;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    const ids = changes.map((change: any) => change.id);
    if (encrypted) {
      await this.encryptedTaskModel.destroy({ where: { id: ids } });
    } else {
      await this.plainTaskModel.destroy({ where: { id: ids } });
    }

    return {
      added: [],
      modified: [],
      removed: changes.map((change: any) => change.content),
    };
  }

  async getTasks(query: any) {
    const { since, userId, deviceId, encrypted } = query;

    if (!userId || !deviceId) {
      throw new Error('Invalid userId or deviceId');
    }

    const utcLastFinishedSyncStart = since ? new Date(+since) : new Date(0);

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
      ? await this.encryptedTaskModel.findAll({ where: whereAdded })
      : await this.plainTaskModel.findAll({ where: whereAdded });

    const modified = encrypted
      ? await this.encryptedTaskModel.findAll({ where: whereModified })
      : await this.plainTaskModel.findAll({ where: whereModified });

    const removed = encrypted
      ? await this.encryptedTaskModel.findAll({ where: whereRemoved })
      : await this.plainTaskModel.findAll({ where: whereRemoved });

    return { added, modified, removed };
  }

  async deleteUserTasks(userId: string) {
    await this.plainTaskModel.destroy({ where: { userId }, force: true });
  }
}