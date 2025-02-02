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
import { TuiButton } from '@taiga-ui/core';

import { Task, Tasks } from '@tmrw/data-access';

import { CategoryCardComponent } from '../_primitives/category-card/category-card.component';
import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_primitives/task-list-header/task-list-header.component';

@Component({
  selector: 'tw-dashboard',
  imports: [
    CommonModule,
    TuiButton,
    CategoryCardComponent,
    TaskListCardComponent,
    TaskListHeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  overDueTasks = signal<Task[]>([]);
  todaysTasks = signal<Task[]>([]);
  upcomingTasks = signal<Task[]>([]);

  hasOverdueTasks = computed(() => this.overDueTasks().length > 0);

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
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

  createTask() {
    const randomTitle = `Task ${Math.floor(Math.random() * 1000)}`;
    const randomDate = new Date(
      Date.now() + Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000,
    );
    const categories = ['Work', 'Personal', 'Health', 'Shopping'];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    Tasks.insert({
      title: randomTitle,
      date: randomDate,
      category: randomCategory,
      completedAt: null,
    });
  }
}
