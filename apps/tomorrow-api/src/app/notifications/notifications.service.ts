import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as webPush from 'web-push';

import { NotificationSubscription } from '../_db/notification-subscription.entity';

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(NotificationSubscription)
    private readonly subscriptionRepository: typeof NotificationSubscription,
  ) {
    webPush.setVapidDetails(
      VAPID_SUBJECT ?? 'mailto: no-reply@example.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY,
    );
  }

  async addSubscription(
    userId: string,
    deviceId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
  ): Promise<NotificationSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, deviceId },
    });
    if (subscription) {
      subscription.endpoint = endpoint;
      subscription.p256dh = p256dh;
      subscription.auth = auth;
      return subscription.save();
    }
    return this.subscriptionRepository.create({
      userId,
      deviceId,
      endpoint,
      p256dh,
      auth,
    });
  }

  async removeSubscription(userId: string, deviceId: string): Promise<void> {
    await this.subscriptionRepository.destroy({
      where: { userId, deviceId },
    });
  }

  async sendNotificationToUsersDevices(
    userId: string,
    payload: string,
  ): Promise<void> {
    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      console.warn('VAPID keys are not set. Skipping notification.');
      return;
    }
    const subscriptions = await this.subscriptionRepository.findAll({
      where: { userId },
    });
    if (subscriptions.length === 0) {
      console.warn(
        `No subscriptions found for user ${userId}. Skipping notification.`,
      );
      return;
    }
    const notifications = subscriptions.map((subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };
      return pushSubscription;
    });
    await Promise.allSettled(
      notifications.map((subscription) =>
        webPush.sendNotification(subscription, payload).catch(async (error) => {
          console.error('Failed to send notification:', error);

          if (error.statusCode === 410 || error.statusCode === 404) {
            console.warn('Removing subscription as it is no longer valid.');
            await this.subscriptionRepository.destroy({
              where: { endpoint: subscription.endpoint },
            });
          }

          return null;
        }),
      ),
    );
  }
}
