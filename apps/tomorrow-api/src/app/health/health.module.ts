import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '../_db/db.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule, DatabaseModule, NotificationsModule],
  controllers: [HealthController],
})
export class HealthModule {}
