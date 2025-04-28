import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
    // TODO: Implement throttling(?)
    HealthModule,
    TasksModule,
    UsersModule,
    NotificationsModule,
  ],
})
export class AppModule {}
