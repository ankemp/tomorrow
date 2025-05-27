import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/sequelize';
import { addMinutes } from 'date-fns';

import { PushNotificationType } from '@tmrw/data-access-models';

import { NotificationEntity } from '../_db/entities/notification.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(NotificationEntity)
    private readonly notificationRepository: typeof NotificationEntity,
    private readonly userService: UsersService,
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
    title: string,
    type: PushNotificationType,
    scheduledAt: Date,
    body?: string,
    data?: Record<string, any>,
  ): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.create({
      userId,
      taskId,
      title,
      type,
      body,
      metadata: data,
      scheduledAt,
    });
    return notification;
  }

  async updateNotification(
    notificationId: string,
    notification: Partial<NotificationEntity>,
  ): Promise<NotificationEntity | null> {
    await this.notificationRepository.update(
      { ...notification },
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

  async markNotificationAsSent(id: string) {
    await this.notificationRepository.update(
      { isSent: true },
      {
        where: {
          id,
        },
      },
    );
  }

  async snoozeNotification(id: string, userId: string) {
    const user = await this.userService.getUser(userId);
    const notification = await this.notificationRepository.findByPk(id);
    await notification.update('isSent', false);
    await notification.update(
      'snoozedUntil',
      addMinutes(notification.scheduledAt, user.snoozeTime),
    );
    await notification.increment('snoozeCount');
    return notification.get();
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
