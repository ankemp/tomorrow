import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DatabaseModule } from '../_db/db.module';
import { User } from '../_db/user.entity';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
