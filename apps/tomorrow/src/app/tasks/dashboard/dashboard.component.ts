import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiChip } from '@taiga-ui/kit';

import { Settings, Tasks } from '@tmrw/data-access';
import { Task, TASK_SORT_DEFAULT, TaskSort } from '@tmrw/data-access-models';
import { ActionBarPortalComponent, FormatDurationPipe } from '@tmrw/ui/core';

import { BulkCompleteTasksButtonComponent } from '../_blocks/bulk-complete-tasks-button.component';
import { BulkMoveTasksToTodayButtonComponent } from '../_blocks/bulk-move-tasks-to-today-button.component';
import { CategoryCardComponent } from '../_blocks/category-card/category-card.component';
import { EmptyStateComponent } from '../_blocks/empty-state/empty-state.component';
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
    ActionBarPortalComponent,
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
  readonly tasksWithTimer = signal<Task[]>([]);
  readonly overdueTasks = signal<Task[]>([]);
  readonly todaysTasks = signal<Task[]>([]);
  readonly todaysSort = signal<TaskSort>(TASK_SORT_DEFAULT);
  readonly includeTodaysCompletedTasks = signal<boolean>(true);
  readonly upcomingTasks = signal<Task[]>([]);
  readonly upcomingSort = signal<TaskSort>(TASK_SORT_DEFAULT);
  readonly isReady = Tasks.isReady();
  readonly hasPinnedTasks = computed(() => this.pinnedTasks().length > 0);
  readonly hasTasksWithTimer = computed(() => this.tasksWithTimer().length > 0);
  readonly hasOverdueTasks = computed(() => this.overdueTasks().length > 0);
  readonly todaysTasksDuration = computed(() => {
    return this.todaysTasks()
      .filter((t) => !t.completedAt)
      .reduce((acc, task) => acc + (task.duration ?? 0), 0);
  });

  constructor() {
    effect((onCleanup) => {
      const pt = Tasks.getPinnedTasks();
      this.pinnedTasks.set(pt.fetch());
      onCleanup(() => {
        pt.cleanup();
      });
    });

    effect((onCleanup) => {
      const wt = Tasks.getTasksWithOngoingTimer();
      this.tasksWithTimer.set(wt.fetch());
      onCleanup(() => {
        wt.cleanup();
      });
    });

    effect((onCleanup) => {
      const ot = Tasks.getOverdueTasks();
      this.overdueTasks.set(ot.fetch());
      onCleanup(() => {
        ot.cleanup();
      });
    });

    effect((onCleanup) => {
      const sort = this.todaysSort();
      const includeCompleted = this.includeTodaysCompletedTasks();
      const tt = Tasks.getTodaysTasks({ sort, includeCompleted });
      this.todaysTasks.set(tt.fetch());
      onCleanup(() => {
        tt.cleanup();
      });
    });

    effect((onCleanup) => {
      const sort = this.upcomingSort();
      const ut = Tasks.getUpcomingTasks({ sort });
      this.upcomingTasks.set(ut.fetch());
      onCleanup(() => {
        ut.cleanup();
      });
    });
  }
}
