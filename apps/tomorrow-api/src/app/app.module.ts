import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { EncryptedTask, PlainTask, User } from './models';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      storage: process.env['DB_PATH'] || ':memory:',
      models: [PlainTask, EncryptedTask, User],
      logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
      synchronize: true,
      sync: {
        force: true,
      },
    }),
    SequelizeModule.forFeature([PlainTask, EncryptedTask, User]),
  ],
  controllers: [TasksController, UsersController],
  providers: [TasksService, UsersService],
})
export class AppModule {}
