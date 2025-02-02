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
import { TuiTitle } from '@taiga-ui/core';
import {
  endOfYesterday,
  format,
  isBefore,
  isToday,
  isTomorrow,
} from 'date-fns';

import { Task, Tasks } from '@tmrw/data-access';

import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';
import { TaskListHeaderComponent } from '../_primitives/task-list-header/task-list-header.component';

const TASK_ORDER = ['Overdue', 'Today', 'Tomorrow'];

@Component({
  selector: 'tw-category',
  imports: [
    CommonModule,
    TuiTitle,
    TaskListCardComponent,
    TaskListHeaderComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  categoryTasks = signal<Task[]>([]);
  title = signal<string>('');

  groupedTasks = computed(() => {
    const grouped = Object.groupBy(this.categoryTasks(), (task) => {
      const date = task.date;
      if (isBefore(date, endOfYesterday())) {
        return 'Overdue';
      }
      if (isToday(date)) {
        return 'Today';
      }
      if (isTomorrow(date)) {
        return 'Tomorrow';
      }
      return format(date, 'EEE, d MMM');
    });
    return Object.entries(grouped)
      .map(([key, value]) => ({ key, value }))
      .toSorted((a, b) => {
        const aIncluded = TASK_ORDER.includes(a.key);
        const bIncluded = TASK_ORDER.includes(b.key);
        if (!aIncluded && !bIncluded) {
          return new Date(a.key).getTime() - new Date(b.key).getTime();
        }
        if (!aIncluded) return 1;
        if (!bIncluded) return -1;
        return TASK_ORDER.indexOf(a.key) - TASK_ORDER.indexOf(b.key);
      });
  });

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    activatedRoute: ActivatedRoute,
  ) {
    this.title.set(activatedRoute.snapshot.params['slug']);
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const c = Tasks.getByCategory(this.title());
        this.categoryTasks.set(c.fetch());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }
}
