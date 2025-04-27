import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DatabaseModule } from '../_db/db.module';
import { EncryptedTask } from '../_db/encrypted_task.entity';
import { PlainTask } from '../_db/plain_task.entity';
import { SSEService } from '../sse.service';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    DatabaseModule,
    SequelizeModule.forFeature([PlainTask, EncryptedTask]),
  ],
  controllers: [TasksController],
  providers: [SSEService, TasksService],
})
export class TasksModule {}
