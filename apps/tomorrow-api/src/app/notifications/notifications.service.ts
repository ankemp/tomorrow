import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/sequelize';

import { NotificationEntity } from '../_db/notification.entity';

@Injectable()
export class NotificationsService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(NotificationEntity)
    private readonly notificationRepository: typeof NotificationEntity,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onApplicationBootstrap() {
    this.notificationRepository.addHook(
      'afterCreate',
      'emitNotificationCreated',
      (notification) => {
        this.eventEmitter.emit('notification.created', notification);
      },
    );

    this.notificationRepository.addHook(
      'afterUpdate',
      'emitNotificationUpdated',
      (notification) => {
        this.eventEmitter.emit('notification.updated', notification);
      },
    );

    this.notificationRepository.addHook(
      'afterDestroy',
      'emitNotificationDeleted',
      (notification) => {
        this.eventEmitter.emit('notification.deleted', notification);
      },
    );
  }

  async createNotification(
    userId: string,
    taskId: string,
    message: string,
    scheduledAt: Date,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.create({
      userId,
      taskId,
      message,
      scheduledAt,
    });
    return notification;
  }

  async updateNotification(
    notificationId: string,
    message: string,
    scheduledAt: Date,
  ): Promise<NotificationEntity | null> {
    await this.notificationRepository.update(
      { message, scheduledAt },
      {
        where: {
          id: notificationId,
        },
      },
    );
    return this.notificationRepository.findOne({
      where: {
        id: notificationId,
      },
    });
  }

  async deleteNotification(notificationId: string) {
    await this.notificationRepository.destroy({
      where: {
        id: notificationId,
      },
    });
  }

  async getNotificationsForUser(userId: string): Promise<NotificationEntity[]> {
    const notifications = await this.notificationRepository.findAll({
      where: {
        userId,
      },
    });
    return notifications;
  }

  async getNotificationById(
    notificationId: string,
  ): Promise<NotificationEntity | null> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
      },
    });
    return notification;
  }

  async getAllUnsentNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.notificationRepository.findAll({
      where: {
        isSent: false,
      },
    });
    return notifications;
  }
}
