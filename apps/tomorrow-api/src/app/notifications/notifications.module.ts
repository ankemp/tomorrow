import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '../_db/db.module';
import { NotificationEntity } from '../_db/entities/notification.entity';
import { PushNotificationSubscriptionEntity } from '../_db/entities/notification-subscription.entity';
import { UsersModule } from '../users/users.module';

import { NotificationSchedulerService } from './notification-scheduler.service';
import { NotificationsController } from './notifications.controller';
import { NotificationHealthIndicator } from './notifications.health';
import { NotificationsService } from './notifications.service';
import { PushSubscriptionService } from './push-subscription.service';
import { SchedulerHealthIndicator } from './scheduler.health';

@Module({
  imports: [
    TerminusModule,
    DatabaseModule,
    SequelizeModule.forFeature([
      PushNotificationSubscriptionEntity,
      NotificationEntity,
    ]),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationSchedulerService,
    NotificationHealthIndicator,
    NotificationsService,
    PushSubscriptionService,
    SchedulerHealthIndicator,
  ],
  exports: [
    NotificationHealthIndicator,
    PushSubscriptionService,
    SchedulerHealthIndicator,
  ],
})
export class NotificationsModule {}
