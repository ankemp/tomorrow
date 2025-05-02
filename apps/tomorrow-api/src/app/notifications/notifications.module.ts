import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '../_db/db.module';
import { NotificationEntity } from '../_db/notification.entity';
import { PushNotificationSubscriptionEntity } from '../_db/notification-subscription.entity';

import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationsController } from './notifications.controller';
import { NotificationHealthIndicator } from './notifications.health';
import { NotificationsService } from './notifications.service';
import { PushSubscriptionService } from './push-subscription.service';

@Module({
  imports: [
    TerminusModule,
    DatabaseModule,
    SequelizeModule.forFeature([
      PushNotificationSubscriptionEntity,
      NotificationEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationSchedulerService,
    NotificationHealthIndicator,
    NotificationsService,
    PushSubscriptionService,
  ],
  exports: [NotificationHealthIndicator, PushSubscriptionService],
})
export class NotificationsModule {}
