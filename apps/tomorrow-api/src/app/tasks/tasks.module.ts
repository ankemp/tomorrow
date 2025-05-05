import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DatabaseModule } from '../_db/db.module';
import { EncryptedTaskEntity } from '../_db/encrypted-task.entity';
import { PlainTaskEntity } from '../_db/plain-task.entity';
import { SSEService } from '../sse.service';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    DatabaseModule,
    SequelizeModule.forFeature([PlainTaskEntity, EncryptedTaskEntity]),
  ],
  controllers: [TasksController],
  providers: [SSEService, TasksService],
})
export class TasksModule {}
