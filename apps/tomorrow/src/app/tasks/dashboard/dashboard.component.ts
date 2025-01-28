import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';

import { CategoryCardComponent } from '../_primitives/category-card/category-card.component';
import { TaskListCardComponent } from '../_primitives/task-list-card/task-list-card.component';

@Component({
  selector: 'tw-dashboard',
  imports: [
    CommonModule,
    TuiTitle,
    CategoryCardComponent,
    TaskListCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  task = {
    title: 'Task 1',
    date: new Date(),
    category: 'Work',
  };
}
