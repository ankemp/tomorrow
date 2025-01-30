import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { TuiButton, TuiTitle } from '@taiga-ui/core';

import { Task, Tasks } from '@tmrw/data-access';

import { CategoryCardComponent } from '../_primitives/category-card/category-card.component';
import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';

@Component({
  selector: 'tw-dashboard',
  imports: [
    CommonModule,
    TuiButton,
    TuiTitle,
    CategoryCardComponent,
    TaskListCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  todaysTasks = signal<Task[]>([]);
  upcomingTasks = signal<Task[]>([]);

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const tt = Tasks.getTodaysTasks();
        this.todaysTasks.set(tt.fetch());
        const ut = Tasks.getUpcomingTasks();
        this.upcomingTasks.set(ut.fetch());
        onCleanup(() => {
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
