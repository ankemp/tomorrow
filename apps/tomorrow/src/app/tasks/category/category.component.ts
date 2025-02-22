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
import { TuiButton, TuiTitle } from '@taiga-ui/core';
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
  selector: 'tw-category',
  imports: [
    CommonModule,
    TuiButton,
    TuiTitle,
    EmptyStateComponent,
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

  readonly tomorrowTasks = computed(() => {
    return this.categoryTasks().filter((task) => {
      return isTomorrow(task.date);
    });
  });

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
        const c = Tasks.getByCategory(this.title());
        this.categoryTasks.set(c.fetch());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }

  completeAll(tasks: Task[]): void {
    tasks.forEach((task) => {
      Tasks.completeTask(task);
    });
  }
}
