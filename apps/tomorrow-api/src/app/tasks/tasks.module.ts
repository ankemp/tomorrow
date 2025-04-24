import { Module } from '@nestjs/common';

import { DatabaseModule } from '../_db/db.module';
import { encryptedTaskProvider } from '../_db/encrypted_task.entity';
import { plainTaskProvider } from '../_db/plain_task.entity';
import { SSEService } from '../sse.service';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TasksController],
  providers: [
    SSEService,
    TasksService,
    plainTaskProvider,
    encryptedTaskProvider,
  ],
})
export class TasksModule {}
