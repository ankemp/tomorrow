import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

import { Notification } from '../_db/notification.entity';

import { NotificationsService } from './notifications.service';
import { PushSubscriptionService } from './push-subscription.service';

@Injectable()
export class NotificationSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationsService: NotificationsService,
    private readonly pushSubscription: PushSubscriptionService,
  ) {}

  onApplicationBootstrap() {
    this.rehydrateNotifications();
  }

  /**
   * // TODO:
   * Add method to send a batched notification, something like:
   * You have X Tasks due at Y timestamp
   */

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
    const notifications =
      await this.notificationsService.getAllUnsentNotifications();
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
