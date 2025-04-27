import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class DBStorageHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    return indicator.up({
      storageType: process.env['DB_PATH'] ? 'disk' : 'in-memory',
      storagePath: process.env['DB_PATH'] || ':memory:',
    });
  }
}
