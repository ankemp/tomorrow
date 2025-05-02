import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

import type { NotificationEntity } from '../_db/notification.entity';

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
   // TODO:
   * Add method to send a batched notification, something like:
   * You have X Tasks due at Y timestamp
   * private readonly notificationMap = new Map<number, string[]>(); // unix timestamp to notificationId array
   * timeouts should be set to the same timestamp as used to create the map entry.
   * Then when the timeout is triggered, we can look to see how many notifications, and either send a batched notification, or individual notifications.
   * For updates, we should probably check if the notification is already scheduled, and if so, update the message.
   * If the time of the notification changes, we'd need to figure out which entry to remove from the map, and add a new one, or append to an already existing one - this could be tricky.
   */

  dispatchNotification(notification: NotificationEntity) {
    this.pushSubscription.sendNotificationToUsersDevices(
      notification.userId,
      notification.message,
    );
  }

  scheduleNotification(notification: NotificationEntity) {
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

  private async rehydrateNotifications() {
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

  @OnEvent('task.created')
  private handleTaskCreatedEvent(payload: any) {
    // TODO: Encrypted tasks
    // this.notificationsService.createNotification(
    //   payload.userId,
    //   payload.taskId,
    //   `Task is due at ${payload.date}`, // TODO: Better messaging
    //   payload.date,
    // );
  }

  @OnEvent('task.updated')
  private handleTaskUpdatedEvent(payload: any) {
    // Update notification in the database, query by taskId
  }

  @OnEvent('task.deleted')
  private handleTaskDeletedEvent(payload: any) {
    // Delete notification in the database, query by taskId
  }
}
