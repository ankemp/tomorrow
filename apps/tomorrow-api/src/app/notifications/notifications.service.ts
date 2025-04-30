import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Notification } from '../_db/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification)
    private readonly notificationRepository: typeof Notification,
  ) {}

  async createNotification(
    userId: string,
    message: string,
    scheduledAt: Date,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      userId,
      message,
      scheduledAt,
    });
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.notificationRepository.findAll({
      where: {
        userId,
      },
    });
    return notifications;
  }

  async getNotificationById(
    userId: string,
    notificationId: string,
  ): Promise<Notification | null> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });
    return notification;
  }
}
