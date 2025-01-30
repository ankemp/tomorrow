import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiTitle } from '@taiga-ui/core';

import { Task, Tasks } from '@tmrw/data-access';

import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';

@Component({
  selector: 'tw-category',
  imports: [CommonModule, TuiTitle, TaskListCardComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  categoryTasks = signal<Task[]>([]);
  title = signal<string>('');

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
