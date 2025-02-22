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
import { RouterModule } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

import { Task, Tasks } from '@tmrw/data-access';

import { ActionBarComponent } from '../../core/action-bar/action-bar-portal.component';
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
    ActionBarComponent,
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
  readonly pinnedTasks = signal<Task[]>([]);
  readonly overDueTasks = signal<Task[]>([]);
  readonly todaysTasks = signal<Task[]>([]);
  readonly upcomingTasks = signal<Task[]>([]);
  readonly isReady = Tasks.isReady();
  readonly hasPinnedTasks = computed(() => this.pinnedTasks().length > 0);
  readonly hasOverdueTasks = computed(() => this.overDueTasks().length > 0);

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

  completeAll(tasks: Task[]) {
    tasks.forEach((task) => {
      Tasks.completeTask(task);
    });
  }
}
