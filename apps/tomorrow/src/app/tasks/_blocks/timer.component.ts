import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  linkedSignal,
} from '@angular/core';
import { intervalToDuration } from 'date-fns';

import { TaskTimer } from '@tmrw/data-access';

const ELAPSED_TIME_FORMAT = '--:--:--';

@Component({
  selector: 'tw-timer',
  imports: [CommonModule],
  template: `<span>{{ elapsedTime() }}</span>`,
  styles: `
    :host {
      display: block;
    }

    span {
      color: var(--tui-text-positive);
      font-size: 2.5rem;
    }
  `,
})
export class TaskTimerComponent {
  readonly timer = input.required<TaskTimer>();
  readonly elapsedTime = linkedSignal<string>(() => {
    const timer = this.timer();
    if (timer.start && timer.end) {
      return this.formatElapsedTime(timer);
    }
    return ELAPSED_TIME_FORMAT;
  });
  readonly loading = computed(() => {
    return this.elapsedTime() === ELAPSED_TIME_FORMAT;
  });

  constructor() {
    effect((onCleanup) => {
      const timer = this.timer();
      let interval: NodeJS.Timeout;
      if (timer && timer.start && !timer.end) {
        this.elapsedTime.set(this.formatElapsedTime(timer));
        interval = setInterval(() => {
          this.elapsedTime.set(this.formatElapsedTime(timer));
        }, 1000);
      }

      onCleanup(() => {
        if (interval) {
          clearInterval(interval);
        }
      });
    });
  }

  formatElapsedTime(timer: TaskTimer): string {
    const { years, months, days, hours, minutes, seconds } = intervalToDuration(
      {
        start: timer.start,
        end: timer.end || new Date(),
      },
    );

    const parts: string[] = [];
    if (years) parts.push(`${years}y`);
    if (months) parts.push(`${months}m`);
    if (days) parts.push(`${days}d`);
    parts.push(this.pad(hours ?? 0) + 'h');
    parts.push(this.pad(minutes ?? 0) + 'm');
    parts.push(this.pad(seconds ?? 0) + 's');

    return parts.join(':');
  }

  pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
