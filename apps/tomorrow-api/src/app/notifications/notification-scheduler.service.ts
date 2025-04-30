import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';

import { Notification } from '../_db/notification.entity';

import { PushSubscriptionService } from './push-subscription.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    @InjectModel(Notification)
    private readonly notificationRepository: typeof Notification,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly pushSubscription: PushSubscriptionService,
  ) {
    this.rehydrateNotifications();
  }

  dispatchNotification(notification: Notification) {
    this.pushSubscription.sendNotificationToUsersDevices(
      notification.userId,
      notification.message,
    );
  }

  scheduleNotification(notification: Notification) {
    if (this.schedulerRegistry.doesExist('timeout', notification.id)) {
      this.logger.error(
        `Notification with ID ${notification.id} is already scheduled.`,
      );
      return;
    }
    const timeout = setTimeout(() => {
      this.dispatchNotification(notification);
    });
    this.schedulerRegistry.addTimeout(notification.id, timeout);
  }

  async rehydrateNotifications() {
    const notifications = await this.notificationRepository.findAll({
      where: {
        isSent: false,
      },
    });
    if (!notifications || notifications.length === 0) {
      this.logger.debug('No notifications to rehydrate.');
      return;
    }
    notifications.forEach((notification) => {
      if (notification.scheduledAt > new Date()) {
        this.scheduleNotification(notification);
      } else {
        this.dispatchNotification(notification);
      }
    });
  }
}
