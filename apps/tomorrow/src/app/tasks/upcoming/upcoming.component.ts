import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { endOfTomorrow, isAfter, isTomorrow } from 'date-fns';

import { Settings, Task, Tasks } from '@tmrw/data-access';

import { EmptyStateComponent } from '../_blocks/empty-state/empty-state.component';
import { TaskListCardComponent } from '../_blocks/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_blocks/task-list-header/task-list-header.component';

@Component({
  selector: 'tw-upcoming',
  imports: [
    CommonModule,
    TuiTitle,
    EmptyStateComponent,
    TaskListCardComponent,
    TaskListHeaderComponent,
  ],
  templateUrl: './upcoming.component.html',
  styleUrl: './upcoming.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpcomingComponent {
  private readonly settings = inject(Settings);
  readonly isReady = Tasks.isReady();
  readonly upcomingTasks = signal<Task[]>([]);
  readonly todaysTasks = signal<Task[]>([]);
  readonly todayHasTasks = computed(() => {
    return this.todaysTasks().length > 0;
  });

  readonly tomorrowsTasks = computed(() => {
    return this.upcomingTasks().filter((task) => {
      return isTomorrow(task.date);
    });
  });
  readonly tomorrowHasTasks = computed(() => {
    return this.tomorrowsTasks().length > 0;
  });

  readonly futureTasks = computed(() => {
    const future = this.upcomingTasks().filter((task) => {
      return isAfter(task.date, endOfTomorrow());
    });
    const grouped = Object.groupBy(future, (task) => {
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
        return isAfter(a.date, b.date) ? 1 : -1;
      });
  });

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const c = Tasks.getUpcomingTasks({ limit: -1 });
        this.upcomingTasks.set(c.fetch());
        onCleanup(() => {
          c.cleanup();
        });
      });
      effect((onCleanup) => {
        const c = Tasks.getTodaysTasks({ includeCompleted: false });
        this.todaysTasks.set(c.fetch());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }
}
