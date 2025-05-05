import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class SchedulerHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const timeouts = this.schedulerRegistry.getTimeouts();

    return indicator.up({ timeouts });
  }
}
