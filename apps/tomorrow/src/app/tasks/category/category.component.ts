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
import { ActivatedRoute } from '@angular/router';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiChip } from '@taiga-ui/kit';
import {
  endOfTomorrow,
  endOfYesterday,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
} from 'date-fns';

import { Task, TASK_SORT_DEFAULT, Tasks, TaskSort } from '@tmrw/data-access';

import { BulkCompleteTasksButtonComponent } from '../_blocks/bulk-complete-tasks-button.component';
import { EmptyStateComponent } from '../_blocks/empty-state/empty-state.component';
import { TaskListCardComponent } from '../_blocks/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_blocks/task-list-header/task-list-header.component';
import { FormatDurationPipe } from '../_primitives/format-duration.pipe';

@Component({
  selector: 'tw-category',
  imports: [
    CommonModule,
    TuiIcon,
    TuiTitle,
    TuiChip,
    BulkCompleteTasksButtonComponent,
    EmptyStateComponent,
    FormatDurationPipe,
    TaskListCardComponent,
    TaskListHeaderComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  readonly categoryTasks = signal<Task[]>([]);
  readonly title = signal<string>('');

  readonly overdueTasks = computed(() => {
    return this.categoryTasks().filter((task) => {
      return isBefore(task.date, endOfYesterday());
    });
  });

  readonly todaysTasks = computed(() => {
    return this.categoryTasks().filter((task) => {
      return isToday(task.date);
    });
  });
  readonly todaysTasksDuration = computed(() => {
    return this.todaysTasks()
      .filter((t) => !t.completedAt)
      .reduce((acc, task) => acc + (task.duration ?? 0), 0);
  });
  readonly todaysSort = signal<TaskSort>(TASK_SORT_DEFAULT);

  readonly tomorrowTasks = computed(() => {
    return this.categoryTasks().filter((task) => {
      return isTomorrow(task.date);
    });
  });
  readonly tomorrowTasksDuration = computed(() => {
    return this.tomorrowTasks()
      .filter((t) => !t.completedAt)
      .reduce((acc, task) => acc + (task.duration ?? 0), 0);
  });
  readonly tomorrowSort = signal<TaskSort>(TASK_SORT_DEFAULT);

  readonly futureTasks = computed(() => {
    return this.categoryTasks().filter((task) => {
      return isAfter(task.date, endOfTomorrow());
    });
  });

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    activatedRoute: ActivatedRoute,
  ) {
    this.title.set(activatedRoute.snapshot.params['slug']);
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        // TODO: Move filtering to the Tasks service instead of using computed
        // TODO: Add sorting
        const c = Tasks.getByCategory({
          category: this.title(),
        });
        this.categoryTasks.set(c.fetch());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }
}
