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
import {
  endOfTomorrow,
  endOfYesterday,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
} from 'date-fns';

import { Task, Tasks } from '@tmrw/data-access';

import { EmptyStateComponent } from '../_primitives/empty-state/empty-state.component';
import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_primitives/task-list-header/task-list-header.component';

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
  readonly completedTasks = signal<Task[]>([]);

  readonly todaysTasks = computed(() => {
    return this.completedTasks().filter((task) => {
      return isToday(task.date);
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
