import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { isAfter, isFuture, isToday, isYesterday } from 'date-fns';

import { Task, Tasks } from '@tmrw/data-access';

import { EmptyStateComponent } from '../_blocks/empty-state/empty-state.component';
import { TaskListCardComponent } from '../_blocks/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_blocks/task-list-header/task-list-header.component';

@Component({
  selector: 'tw-completed',
  imports: [
    CommonModule,
    TuiTitle,
    EmptyStateComponent,
    TaskListCardComponent,
    TaskListHeaderComponent,
  ],
  templateUrl: './completed.component.html',
  styleUrl: './completed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletedComponent {
  readonly isReady = Tasks.isReady();
  readonly completedTasks = signal<Task[]>([]);

  readonly olderTasks = computed(() => {
    const older = this.completedTasks().filter((task) => {
      return (
        !isToday(task.date) && !isYesterday(task.date) && !isFuture(task.date)
      );
    });
    const grouped = Object.groupBy(older, (task) => {
      return task.date.toDateString();
    });
    return Object.entries(grouped)
      .map(([date, tasks]) => {
        return {
          date,
          tasks: tasks as Task[],
        };
      })
      .toSorted((a, b) => {
        return isAfter(a.date, b.date) ? -1 : 1;
      });
  });

  readonly futureTasks = computed(() => {
    return this.completedTasks().filter((task) => {
      return !isToday(task.date) && isFuture(task.date);
    });
  });
  readonly hasFutureTasks = computed(() => {
    return this.futureTasks().length > 0;
  });

  readonly todaysTasks = computed(() => {
    return this.completedTasks().filter((task) => {
      return isToday(task.date);
    });
  });

  readonly yesterdaysTasks = computed(() => {
    return this.completedTasks().filter((task) => {
      return isYesterday(task.date);
    });
  });

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const c = Tasks.getCompletedTasks();
        this.completedTasks.set(c.fetch());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }
}
