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

import { Settings, Task, Tasks } from '@tmrw/data-access';

import { ActionBarComponent } from '../../core/action-bar/action-bar-portal.component';
import { BulkCompleteTasksButtonComponent } from '../_primitives/bulk-complete-tasks-button.component';
import { BulkMoveTasksToTodayButtonComponent } from '../_primitives/bulk-move-tasks-to-today-button.component';
import { CategoryCardComponent } from '../_primitives/category-card/category-card.component';
import { EmptyStateComponent } from '../_primitives/empty-state/empty-state.component';
import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_primitives/task-list-header/task-list-header.component';

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
  readonly upcomingTasks = signal<Task[]>([]);
  readonly isReady = Tasks.isReady();
  readonly hasPinnedTasks = computed(() => this.pinnedTasks().length > 0);
  readonly hasOverdueTasks = computed(() => this.overDueTasks().length > 0);
  readonly todaysTasksDuration = computed(() => {
    const minutes = this.todaysTasks()
      .filter((t) => !t.completedAt)
      .reduce((acc, task) => acc + (task.duration ?? 0), 0);
    return this.minutesToHoursAndMinutes(minutes);
  });
  readonly upcomingTasksDuration = computed(() => {
    const minutes = this.upcomingTasks()
      .filter((t) => !t.completedAt)
      .reduce((acc, task) => acc + (task.duration ?? 0), 0);
    return this.minutesToHoursAndMinutes(minutes);
  });

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const pt = Tasks.getPinnedTasks();
        this.pinnedTasks.set(pt.fetch());
        const ot = Tasks.getOverdueTasks();
        this.overDueTasks.set(ot.fetch());
        const tt = Tasks.getTodaysTasks();
        this.todaysTasks.set(tt.fetch());
        const ut = Tasks.getUpcomingTasks();
        this.upcomingTasks.set(ut.fetch());
        onCleanup(() => {
          ot.cleanup();
          tt.cleanup();
          ut.cleanup();
        });
      });
    }
  }

  private minutesToHoursAndMinutes(minutes: number) {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }
}
