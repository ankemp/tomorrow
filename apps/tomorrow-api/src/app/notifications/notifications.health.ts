import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, HttpHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class NotificationHealthIndicator {
  constructor(
    private http: HttpHealthIndicator,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const requiredEnvVars = ['VAPID_PRIVATE_KEY', 'VAPID_PUBLIC_KEY'];
    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar],
    );

    if (missingEnvVars.length > 0) {
      return indicator.down({
        missingEnvVars,
      });
    }

    const notificationProviders = [
      { name: 'apple', url: 'https://api.push.apple.com' },
      { name: 'firebase', url: 'https://fcm.googleapis.com' },
      { name: 'moz', url: 'https://updates.push.services.mozilla.com' },
    ];

    for (const provider of notificationProviders) {
      try {
        const response = await this.http.pingCheck(provider.name, provider.url);
        if (!response) {
          return indicator.down({
            provider: provider.name,
            status: 'unreachable',
          });
        }
      } catch (error) {
        return indicator.down({
          provider: provider.name,
          error: error.message,
        });
      }
    }

    return indicator.up();
  }
}
