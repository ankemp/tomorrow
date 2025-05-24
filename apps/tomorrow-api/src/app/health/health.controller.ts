import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

import { DBStorageHealthIndicator } from '../_db/db-storage.health';
import { NotificationHealthIndicator } from '../notifications/notifications.health';
import { SchedulerHealthIndicator } from '../notifications/scheduler.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: SequelizeHealthIndicator,
    private dbStorage: DBStorageHealthIndicator,
    private notifications: NotificationHealthIndicator,
    private schedulerHealth: SchedulerHealthIndicator,
  ) {}

  @Get('readiness')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('internet', 'https://www.google.com'),
      () => this.db.pingCheck('database'),
      () => this.dbStorage.isHealthy('db-storage'),
      () => this.notifications.isHealthy('notifications'),
      () => this.schedulerHealth.isHealthy('scheduler'),
    ]);
  }
}
