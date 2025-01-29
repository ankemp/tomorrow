import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
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
  tasks = signal<Task[]>([]);

  constructor() {
    effect((onCleanup) => {
      const cursor = Tasks.find();
      this.tasks.set(cursor.fetch());
      onCleanup(() => {
        cursor.cleanup();
      });
    });
  }

  createTask() {
    Tasks.insert({
      title: 'Task 1',
      date: new Date(),
      category: 'Work',
      completedAt: null,
    });
  }
}
