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
import { RouterModule } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiChip } from '@taiga-ui/kit';

import {
  Settings,
  Task,
  TASK_SORT_DEFAULT,
  Tasks,
  TaskSort,
} from '@tmrw/data-access';

import { ActionBarComponent } from '../../core/action-bar/action-bar-portal.component';
import { BulkCompleteTasksButtonComponent } from '../_blocks/bulk-complete-tasks-button.component';
import { BulkMoveTasksToTodayButtonComponent } from '../_blocks/bulk-move-tasks-to-today-button.component';
import { CategoryCardComponent } from '../_blocks/category-card/category-card.component';
import { EmptyStateComponent } from '../_blocks/empty-state/empty-state.component';
import { FormatDurationPipe } from '../_primitives/format-duration.pipe';
import { TaskListCardComponent } from '../_blocks/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_blocks/task-list-header/task-list-header.component';

@Component({
  selector: 'tw-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    TuiButton,
    TuiChip,
    TuiIcon,
    ActionBarComponent,
    BulkCompleteTasksButtonComponent,
    BulkMoveTasksToTodayButtonComponent,
    CategoryCardComponent,
    EmptyStateComponent,
    FormatDurationPipe,
    TaskListCardComponent,
    TaskListHeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly settings = inject(Settings);
  readonly pinnedTasks = signal<Task[]>([]);
  readonly overDueTasks = signal<Task[]>([]);
  readonly todaysTasks = signal<Task[]>([]);
  readonly todaysSort = signal<TaskSort>(TASK_SORT_DEFAULT);
  readonly upcomingTasks = signal<Task[]>([]);
  readonly upcomingSort = signal<TaskSort>(TASK_SORT_DEFAULT);
  readonly isReady = Tasks.isReady();
  readonly hasPinnedTasks = computed(() => this.pinnedTasks().length > 0);
  readonly hasOverdueTasks = computed(() => this.overDueTasks().length > 0);
  readonly todaysTasksDuration = computed(() => {
    return this.todaysTasks()
      .filter((t) => !t.completedAt)
      .reduce((acc, task) => acc + (task.duration ?? 0), 0);
  });

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const pt = Tasks.getPinnedTasks();
        this.pinnedTasks.set(pt.fetch());
        onCleanup(() => {
          pt.cleanup();
        });
      });

      effect((onCleanup) => {
        const ot = Tasks.getOverdueTasks();
        this.overDueTasks.set(ot.fetch());
        onCleanup(() => {
          ot.cleanup();
        });
      });

      effect((onCleanup) => {
        const sort = this.todaysSort();
        const tt = Tasks.getTodaysTasks(sort);
        this.todaysTasks.set(tt.fetch());
        onCleanup(() => {
          tt.cleanup();
        });
      });

      effect((onCleanup) => {
        const sort = this.upcomingSort();
        const ut = Tasks.getUpcomingTasks(sort);
        this.upcomingTasks.set(ut.fetch());
        onCleanup(() => {
          ut.cleanup();
        });
      });
    }
  }
}
