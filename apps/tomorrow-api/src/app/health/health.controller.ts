import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

import { DBStorageHealthIndicator } from '../_db/db-storage.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: SequelizeHealthIndicator,
    private dbStorage: DBStorageHealthIndicator,
  ) {}

  @Get('readiness')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('internet', 'https://www.google.com'),
      () => this.db.pingCheck('database'),
      () => this.dbStorage.isHealthy('db-storage'),
    ]);
  }
}
