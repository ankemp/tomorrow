import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

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
      subscription: PushSubscriptionJSON;
    },
  ) {
    const { userId, deviceId, subscription } = body;
    return this.notificationsService.addSubscription(
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
    return this.notificationsService.removeSubscription(userId, deviceId);
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
    return this.notificationsService.sendNotificationToDevice(
      userId,
      deviceId,
      'Test notification',
    );
  }

  @Get('public-key')
  async getPublicKey() {
    const publicKey = await this.notificationsService.getPublicKey();
    return { publicKey };
  }
}
