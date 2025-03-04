import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TuiRipple, TuiSwipeActions } from '@taiga-ui/addon-mobile';
import {
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiIcon,
  TuiSurface,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiChip, TuiFade } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';

import { Settings, Task } from '@tmrw/data-access';

import { TaskService } from '../../task.service';
import { FormatDatePipe } from '../format-date.pipe';
import { FormatDurationPipe } from '../format-duration.pipe';
import { PriorityPinComponent } from '../priority-pin.component';

@Component({
  selector: 'tw-task-list-card',
  imports: [
    CommonModule,
    RouterModule,
    TuiRipple,
    TuiSwipeActions,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiIcon,
    TuiSurface,
    TuiTitle,
    TuiChip,
    TuiFade,
    TuiCell,
    FormatDatePipe,
    FormatDurationPipe,
    PriorityPinComponent,
  ],
  providers: [TaskService],
  templateUrl: './task-list-card.component.html',
  styleUrl: './task-list-card.component.css',
})
export class TaskListCardComponent {
  readonly router = inject(Router);
  readonly taskService = inject(TaskService);
  readonly settings = inject(Settings);
  readonly task = input.required<Task>();
  readonly showCategory = input<boolean>(true);
  readonly showSubtasks = input<boolean>(true);
  readonly showDuration = input<boolean>(true);
  readonly showPriority = input<boolean>(true);
  readonly strikeThrough = input<boolean>(true);
  readonly fullDateFormat = input<boolean>(false);

  readonly icon = computed(() => {
    return this.task().completedAt ? '@tui.circle-check' : '@tui.circle';
  });

  readonly completedSubtaskCount = computed(() => {
    return (
      this.task().subTasks?.filter((subtask) => subtask.completedAt).length ?? 0
    );
  });

  readonly subtaskCount = computed(() => {
    return this.task().subTasks?.length ?? 0;
  });
}
