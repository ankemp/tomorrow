import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { differenceInDays, differenceInMilliseconds, isPast } from 'date-fns';
import { isNil } from 'es-toolkit';

import {
  PushNotificationEvent,
  PushNotificationType,
} from '@tmrw/data-access-models';

import type { NotificationEntity } from '../_db/entities/notification.entity';
import type { PlainTaskEntity } from '../_db/entities/plain-task.entity';

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
    this.logger.debug(`Rehydrating ${notifications.length} notifications.`);
    notifications.forEach((notification) => {
      if (isPast(notification.scheduledAt)) {
        this.dispatchNotification(notification);
      } else {
        this.scheduleNotification(notification);
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

  async dispatchNotification(notification: NotificationEntity) {
    // TODO: Improve notification message
    await this.pushSubscription.sendNotificationToUsersDevices(
      notification.userId,
      new PushNotificationEvent(notification.message, {
        body: `Task: ${notification.taskId} is due at ${notification.scheduledAt.toLocaleString()}`,
        icon: 'assets/icons/icon-512x512.png', // TODO: Use a proper icon
        timestamp: notification.scheduledAt.getTime(),
        tag: notification.id,
        data: {
          url: `/tasks/${notification.taskId}`, // Link to the task
          type: PushNotificationType.TASK,
        },
      }),
    );
    await this.notificationsService.markNotificationAsSent(notification.id);
  }

  @OnEvent('notification.created')
  scheduleNotification(notification: NotificationEntity) {
    if (isPast(notification.scheduledAt)) {
      this.logger.warn(
        `Notification ${notification.id} is in the past, unable to schedule.`,
      );
      return;
    }
    const now = new Date();
    let timeout: NodeJS.Timeout;
    if (differenceInDays(notification.scheduledAt, now) > 24) {
      timeout = setTimeout(
        () => {
          this.scheduleNotification(notification);
        },
        12 * 24 * 60 * 60 * 1000, // 12 days (half of the 24 limit)
      );
    } else {
      timeout = setTimeout(
        () => {
          this.dispatchNotification(notification);
        },
        differenceInMilliseconds(notification.scheduledAt, now),
      );
    }
    this.schedulerRegistry.addTimeout(notification.id, timeout);
  }

  @OnEvent('notification.updated')
  updateNotification(notification: NotificationEntity) {
    if (notification.isSent) {
      this.logger.warn(
        `Notification ${notification.id} is already sent, unable to update.`,
      );
      return;
    }
    const timeout = this.schedulerRegistry.getTimeout(notification.id);
    if (isNil(timeout)) {
      this.logger.warn(
        `No timeout found for notification ${notification.id}, unable to update.`,
      );
      return;
    }
    this.schedulerRegistry.deleteTimeout(notification.id);
    this.scheduleNotification(notification);
  }

  @OnEvent('notification.deleted')
  deleteNotification(notification: NotificationEntity) {
    const timeout = this.schedulerRegistry.getTimeout(notification.id);
    if (isNil(timeout)) {
      this.logger.warn(
        `No timeout found for notification ${notification.id}, unable to delete.`,
      );
      return;
    }
    this.schedulerRegistry.deleteTimeout(notification.id);
  }

  // TODO: Encrypted tasks
  @OnEvent('task.created')
  private handleTaskCreatedEvent(task: PlainTaskEntity) {
    if (!task.reminder) {
      return;
    }
    this.notificationsService.createNotification(
      task.userId,
      task.id,
      `Reminder to complete ${task.title}`, // TODO: Better messaging
      task.date,
    );
  }

  @OnEvent('task.updated')
  private handleTaskUpdatedEvent(task: PlainTaskEntity) {
    if (!task.reminder) {
      this.notificationsService.deleteNotification(task.id);
      return;
    }
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
