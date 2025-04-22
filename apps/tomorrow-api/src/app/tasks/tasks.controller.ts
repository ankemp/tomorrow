import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Sse,
} from '@nestjs/common';
import { Changeset } from '@signaldb/core/index';

import { Task } from '@tmrw/data-access';

import { SSEService } from '../sse.service';

import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly sseService: SSEService<Changeset<Task>>,
  ) {}

  @Sse('events/user/:userId')
  taskSse(
    @Param('userId') userId: string,
    @Query('deviceId') deviceId: string
  ) {
    if (!userId || !deviceId) {
      throw new HttpException(
        'Invalid userId or deviceId',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sseService.getEventObservable(userId, deviceId);
  }

  @Post()
  async createTasks(@Body() body: any) {
    try {
      return await this.tasksService.createTasks(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put()
  async updateTasks(@Body() body: any) {
    try {
      return await this.tasksService.updateTasks(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete()
  async deleteTasks(@Body() body: any) {
    try {
      return await this.tasksService.deleteTasks(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getTasks(@Query() query: any) {
    try {
      return await this.tasksService.getTasks(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('user/:userId')
  async deleteUserTasks(@Param('userId') userId: string) {
    try {
      await this.tasksService.deleteUserTasks(userId);
      return { status: 'success' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
