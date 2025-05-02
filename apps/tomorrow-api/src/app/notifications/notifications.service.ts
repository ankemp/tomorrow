import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { NotificationEntity } from '../_db/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationEntity)
    private readonly notificationRepository: typeof NotificationEntity,
  ) {}

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
    userId: string,
    notificationId: string,
    message: string,
  ): Promise<NotificationEntity | null> {
    await this.notificationRepository.update(
      { message },
      {
        where: {
          id: notificationId,
          userId,
        },
      },
    );
    return this.notificationRepository.findOne({
      where: {
        id: notificationId,
        userId,
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

  getAllUnsentNotifications(): Promise<NotificationEntity[]> {
    return this.notificationRepository.findAll({
      where: {
        isSent: false,
      },
    });
  }
}
