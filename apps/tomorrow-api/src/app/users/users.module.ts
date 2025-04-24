import { Module } from '@nestjs/common';

import { DatabaseModule } from '../_db/db.module';
import { userProvider } from '../_db/user.entity';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, userProvider],
})
export class UsersModule {}
