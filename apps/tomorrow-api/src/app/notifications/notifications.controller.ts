import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { addMinutes } from 'date-fns';

import {
  PushNotificationEvent,
  PushNotificationType,
} from '@tmrw/data-access-models';

import { NotificationsService } from './notifications.service';
import { PushSubscriptionService } from './push-subscription.service';
import { VapidKeyGuard } from './vapid-key.guard';

@UseGuards(VapidKeyGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  @Post('subscribe')
  async addSubscription(
    @Body()
    body: {
      userId: string;
      deviceId: string;
      subscription: PushSubscriptionJSON;
    },
  ) {
    const { userId, deviceId, subscription } = body;
    return this.pushSubscriptionService.addSubscription(
      userId,
      deviceId,
      subscription,
    );
  }

  @Post('unsubscribe')
  async removeSubscription(
    @Body()
    body: {
      userId: string;
      deviceId: string;
    },
  ) {
    const { userId, deviceId } = body;
    return this.pushSubscriptionService.removeSubscription(userId, deviceId);
  }

  @Post('test')
  async sendNotificationToUsersDevices(
    @Body()
    body: {
      userId: string;
      deviceId: string;
    },
  ) {
    const { userId, deviceId } = body;
    return this.pushSubscriptionService.sendNotificationToDevice(
      userId,
      deviceId,
      new PushNotificationEvent('Test Notification', {
        body: 'This is a test notification from Tomorrow API.',
        timestamp: Date.now(),
        data: {
          type: PushNotificationType.TEST,
        },
      }),
    );
  }

  @Post('scheduled-test')
  async sendScheduledNotificationToUsersDevices(
    @Body()
    body: {
      userId: string;
      delay: number;
    },
  ) {
    const { userId, delay } = body;
    await this.notificationsService.createNotification(
      userId,
      '',
      'Scheduled Test Notification',
      addMinutes(new Date(), delay),
    );
  }

  @Get('public-key')
  async getPublicKey() {
    const publicKey = await this.pushSubscriptionService.getPublicKey();
    return { publicKey };
  }

  @Post(':notificationId/snooze')
  async snoozeNotification(
    @Param('notificationId') notificationId: string,
    @Body()
    body: {
      userId: string;
    },
  ) {
    const { userId } = body;
    return this.notificationsService.snoozeNotification(notificationId, userId);
  }
}
