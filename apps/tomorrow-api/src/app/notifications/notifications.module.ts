import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '../_db/db.module';
import { NotificationSubscription } from '../_db/notification-subscription.entity';

import { NotificationsController } from './notifications.controller';
import { NotificationHealthIndicator } from './notifications.health';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TerminusModule,
    DatabaseModule,
    SequelizeModule.forFeature([NotificationSubscription]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationHealthIndicator],
  exports: [NotificationsService, NotificationHealthIndicator],
})
export class NotificationsModule {}
