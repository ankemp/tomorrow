import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Sse,
} from '@nestjs/common';
import type { Changeset } from '@signaldb/core/index';

import {
  type Task,
  TASK_SSE_EVENT,
  TasksChangePayload,
} from '@tmrw/data-access-models';

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
    @Query('deviceId') deviceId: string,
  ) {
    if (!userId || !deviceId) {
      throw new HttpException(
        'Invalid userId or deviceId',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.sseService.getEventObservable(userId, deviceId, TASK_SSE_EVENT);
  }

  @Post()
  async createTasks(@Body() body: TasksChangePayload) {
    try {
      await this.tasksService.createTasks(body);
      return { status: HttpStatus.CREATED };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put()
  async updateTasks(@Body() body: TasksChangePayload) {
    try {
      await this.tasksService.updateTasks(body);
      return { status: HttpStatus.ACCEPTED };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete()
  async deleteTasks(@Body() body: TasksChangePayload) {
    try {
      await this.tasksService.deleteTasks(body);
      return { status: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async getTasks(
    @Query('encrypted', new ParseBoolPipe()) encrypted: boolean,
    @Query('userId') userId: string,
    @Query('deviceId') deviceId: string,
    @Query('since', new ParseIntPipe({ optional: true })) since?: number,
  ) {
    try {
      return await this.tasksService.getTasks({
        since,
        encrypted,
        userId,
        deviceId,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('user/:userId')
  async deleteUserTasks(@Param('userId') userId: string) {
    try {
      await this.tasksService.deleteUserTasks(userId);
      return { status: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
