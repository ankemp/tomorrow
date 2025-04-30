import { Injectable, MessageEvent } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';

@Injectable()
export class SSEService<T> {
  private events$ = new Subject<{
    changeset: T;
    userId: string;
    deviceId: string;
  }>();

  emitEvent(changeset: T, userId: string, deviceId: string) {
    this.events$.next({ changeset, userId, deviceId });
  }

  getEventObservable(
    userId: string,
    deviceId: string,
    eventType: string,
  ): Observable<MessageEvent> {
    return this.events$.asObservable().pipe(
      filter((event) => event.userId === userId && event.deviceId !== deviceId),
      map((event) => {
        return {
          data: JSON.stringify(event.changeset),
          id: crypto.randomUUID(),
          type: eventType,
        } satisfies MessageEvent;
      }),
    );
  }
}
