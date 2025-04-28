import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { NotificationSubscription } from '../_db/notification-subscription.entity';

import { NotificationsService } from './notifications.service';
import { VapidKeyGuard } from './vapid-key.guard';

@UseGuards(VapidKeyGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  async addSubscription(
    @Body()
    body: {
      userId: string;
      deviceId: string;
      endpoint: string;
      p256dh: string;
      auth: string;
    },
  ): Promise<NotificationSubscription> {
    const { userId, deviceId, endpoint, p256dh, auth } = body;
    return this.notificationsService.addSubscription(
      userId,
      deviceId,
      endpoint,
      p256dh,
      auth,
    );
  }

  @Post('unsubscribe')
  async removeSubscription(
    @Body()
    body: {
      userId: string;
      deviceId: string;
    },
  ): Promise<void> {
    const { userId, deviceId } = body;
    return this.notificationsService.removeSubscription(userId, deviceId);
  }
}
