import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiButton, TuiSurface, TuiTitle } from '@taiga-ui/core';
import { TuiBadge, TuiFade } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';

import { Task, Tasks } from '@tmrw/data-access';

@Component({
  selector: 'tw-task-list-card',
  imports: [
    CommonModule,
    TuiButton,
    TuiSurface,
    TuiTitle,
    TuiBadge,
    TuiFade,
    TuiCell,
  ],
  templateUrl: './task-list-card.component.html',
  styleUrl: './task-list-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListCardComponent {
  task = input.required<Task>();
  dateFormat = input<string>('shortTime');

  icon = computed(() => {
    return this.task().completedAt ? '@tui.circle-check' : '@tui.circle';
  });

  toggleTask() {
    Tasks.toggleTask(this.task());
  }
}
