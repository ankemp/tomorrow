import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  PushSubscription,
  sendNotification,
  setVapidDetails,
  WebPushError,
} from 'web-push';

import { PushNotificationSubscriptionEntity } from '../_db/entities/notification-subscription.entity';

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;

@Injectable()
export class PushSubscriptionService {
  private readonly logger = new Logger(PushSubscriptionService.name);

  constructor(
    @InjectModel(PushNotificationSubscriptionEntity)
    private readonly subscriptionRepository: typeof PushNotificationSubscriptionEntity,
  ) {
    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      this.logger.warn('VAPID keys are not set.');
      return;
    }
    setVapidDetails(
      VAPID_SUBJECT ?? 'mailto: no-reply@example.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY,
    );
  }

  async getPublicKey(): Promise<string> {
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key is not set.');
    }
    return VAPID_PUBLIC_KEY;
  }

  async addSubscription(
    userId: string,
    deviceId: string,
    pushSubscription: PushSubscriptionJSON,
  ): Promise<PushNotificationSubscriptionEntity> {
    const { endpoint, keys } = pushSubscription;
    const [subscription, created] =
      await this.subscriptionRepository.findOrCreate({
        where: { userId, deviceId },
        defaults: { endpoint, ...keys },
      });
    if (!created) {
      await this.subscriptionRepository.update(
        { endpoint, ...keys },
        { where: { userId, deviceId } },
      );
      return this.subscriptionRepository.findOne({
        where: { userId, deviceId },
      });
    }
    return subscription;
  }

  removeSubscription(userId: string, deviceId: string) {
    return this.subscriptionRepository.destroy({
      where: { userId, deviceId },
    });
  }

  async sendNotificationToUsersDevices(
    userId: string,
    payload: Pick<Notification, 'title' | 'body' | 'data'>,
  ): Promise<void> {
    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      this.logger.error('VAPID keys are not set. Skipping notification.');
      return;
    }
    const subscriptions = await this.subscriptionRepository.findAll({
      where: { userId },
    });
    if (subscriptions.length === 0) {
      this.logger.warn(
        `No subscriptions found for user ${userId}. Skipping notification.`,
      );
      return;
    }
    const payloadBuffer = Buffer.from(JSON.stringify(payload));

    await Promise.allSettled(
      subscriptions
        .map((subscription) => {
          const pushSubscription: PushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };
          return pushSubscription;
        })
        .map((subscription) =>
          sendNotification(subscription, payloadBuffer).catch(
            (error: WebPushError) =>
              this.handleNotificationError(subscription, error),
          ),
        ),
    );
  }

  async sendNotificationToDevice(
    userId: string,
    deviceId: string,
    payload: string,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, deviceId },
    });
    if (!subscription) {
      this.logger.warn(
        `No subscription found for user ${userId} and device ${deviceId}. Skipping notification.`,
      );
      return;
    }
    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };
    await sendNotification(pushSubscription, payload).catch(
      (error: WebPushError) =>
        this.handleNotificationError(pushSubscription, error),
    );
  }

  private async handleNotificationError(
    subscription: PushSubscription,
    error: WebPushError,
  ): Promise<void> {
    this.logger.error('Failed to send notification:', error);

    if (error.statusCode === 410 || error.statusCode === 404) {
      this.logger.warn('Removing subscription as it is no longer valid.');
      await this.subscriptionRepository.destroy({
        where: { endpoint: subscription.endpoint },
      });
    }
  }
}
