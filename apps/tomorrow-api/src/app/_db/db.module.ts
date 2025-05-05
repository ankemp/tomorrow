import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';

import { DBService } from './db.service';
import { DBStorageHealthIndicator } from './db-storage.health';
import { EncryptedTaskEntity } from './encrypted-task.entity';
import { NotificationEntity } from './notification.entity';
import { PushNotificationSubscriptionEntity } from './notification-subscription.entity';
import { PlainTaskEntity } from './plain-task.entity';
import { UserEntity } from './user.entity';

import 'sqlite3';

const isDevMode =
  !process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development';

@Module({
  imports: [
    TerminusModule,
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: process.env['DB_PATH'] || ':memory:',
      logging: isDevMode ? console.log : false,
      models: [
        PlainTaskEntity,
        EncryptedTaskEntity,
        UserEntity,
        PushNotificationSubscriptionEntity,
        NotificationEntity,
      ],
      synchronize: true,
      sync: {
        force: isDevMode,
        alter: true,
        // TODO: Setup migrations, and disable alter mode
      },
    }),
  ],
  providers: [DBStorageHealthIndicator, DBService],
  exports: [SequelizeModule, DBStorageHealthIndicator],
})
export class DatabaseModule {}
