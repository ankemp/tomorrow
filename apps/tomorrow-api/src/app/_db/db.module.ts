import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';

import { DBStorageHealthIndicator } from './db-storage.health';
import { EncryptedTask } from './encrypted_task.entity';
import { PlainTask } from './plain_task.entity';
import { User } from './user.entity';

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
      models: [PlainTask, EncryptedTask, User],
      synchronize: true,
    }),
  ],
  providers: [DBStorageHealthIndicator],
  exports: [SequelizeModule, DBStorageHealthIndicator],
})
export class DatabaseModule {}
