import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

import type { NotificationEntity } from '../_db/notification.entity';
import type { PlainTaskEntity } from '../_db/plain-task.entity';

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

  /**
   // TODO:
   * Add/modify method to send a batched notification, something like:
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

  @OnEvent('notification.created')
  scheduleNotification(notification: NotificationEntity) {
    const timeout = setTimeout(() => {
      this.dispatchNotification(notification);
    });
    this.schedulerRegistry.addTimeout(notification.id, timeout);
  }

  @OnEvent('notification.updated')
  updateNotification(notification: NotificationEntity) {
    const timeout = this.schedulerRegistry.getTimeout(notification.id);
    if (timeout) {
      this.schedulerRegistry.deleteTimeout(notification.id);
      this.scheduleNotification(notification);
    } else {
      this.logger.warn(
        `No timeout found for notification ${notification.id}, unable to update.`,
      );
    }
  }

  @OnEvent('notification.deleted')
  deleteNotification(notification: NotificationEntity) {
    const timeout = this.schedulerRegistry.getTimeout(notification.id);
    if (timeout) {
      this.schedulerRegistry.deleteTimeout(notification.id);
    } else {
      this.logger.warn(
        `No timeout found for notification ${notification.id}, unable to delete.`,
      );
    }
  }

  // TODO: Encrypted tasks
  @OnEvent('task.created')
  private handleTaskCreatedEvent(task: PlainTaskEntity) {
    this.notificationsService.createNotification(
      task.userId,
      task.id,
      `Reminder to complete ${task.title}`, // TODO: Better messaging
      task.date,
    );
  }

  @OnEvent('task.updated')
  private handleTaskUpdatedEvent(task: PlainTaskEntity) {
    this.notificationsService.updateNotification(
      task.id,
      `Reminder to complete ${task.title}`, // TODO: Better messaging
      task.date,
    );
  }

  @OnEvent('task.deleted')
  private handleTaskDeletedEvent(task: PlainTaskEntity) {
    this.notificationsService.deleteNotification(task.id);
  }
}
