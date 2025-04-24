import { Injectable } from '@nestjs/common';
import { filter, Subject } from 'rxjs';

@Injectable()
export class SSEService<T> {
  private events = new Subject<{
    changeset: T;
    userId: string;
    deviceId: string;
  }>();

  emitEvent(changeset: T, userId: string, deviceId: string) {
    this.events.next({ changeset, userId, deviceId });
  }

  getEventObservable(userId: string, deviceId: string) {
    return this.events
      .asObservable()
      .pipe(
        filter(
          (event) => event.userId === userId && event.deviceId !== deviceId,
        ),
      );
  }
}
