import { Body, Controller, Post, UseGuards } from '@nestjs/common';

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
  ) {
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
  ) {
    const { userId, deviceId } = body;
    return this.notificationsService.removeSubscription(userId, deviceId);
  }
}
