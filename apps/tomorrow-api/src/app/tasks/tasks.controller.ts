import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res, HttpException, HttpStatus, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Request, Response } from 'express';

import { addSseClient, removeSseClient } from '../helpers/sse.helpers';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('events/user/:userId')
  async getTaskEvents(
    @Param('userId') userId: string,
    @Query('deviceId') deviceId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    if (!userId || !deviceId) {
      throw new HttpException('Invalid userId or deviceId', HttpStatus.BAD_REQUEST);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    addSseClient(userId, deviceId, res);

    req.on('close', () => {
      removeSseClient(userId, deviceId);
    });
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