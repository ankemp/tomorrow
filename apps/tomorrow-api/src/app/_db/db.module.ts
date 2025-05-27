import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';

import { EncryptedTaskEntity } from './entities/encrypted-task.entity';
import { NotificationEntity } from './entities/notification.entity';
import { PushNotificationSubscriptionEntity } from './entities/notification-subscription.entity';
import { PlainTaskEntity } from './entities/plain-task.entity';
import { UserEntity } from './entities/user.entity';
import { DBStorageHealthIndicator } from './db-storage.health';

import 'sqlite3';

const isDevMode =
  !process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development';

if (process.env['NODE_ENV'] === 'production' && !process.env['DB_PATH']) {
  throw new Error('DB_PATH must be set in production mode');
}

@Module({
  imports: [
    TerminusModule,
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: process.env['DB_PATH'] || ':memory:',
      logging: isDevMode ? Logger.verbose : false,
      models: [
        PlainTaskEntity,
        EncryptedTaskEntity,
        UserEntity,
        PushNotificationSubscriptionEntity,
        NotificationEntity,
      ],
    }),
  ],
  providers: [DBStorageHealthIndicator],
  exports: [SequelizeModule, DBStorageHealthIndicator],
})
export class DatabaseModule {}
