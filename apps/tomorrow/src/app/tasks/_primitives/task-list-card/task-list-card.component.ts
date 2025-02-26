import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiDialogService,
  TuiSurface,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiChip, TuiFade } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { tap } from 'rxjs';

import { Settings, Task, Tasks } from '@tmrw/data-access';

import { FormatDatePipe } from '../format-date.pipe';
import { FormatDurationPipe } from '../format-duration.pipe';

@Component({
  selector: 'tw-task-list-card',
  imports: [
    CommonModule,
    RouterModule,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiSurface,
    TuiTitle,
    TuiChip,
    TuiFade,
    TuiCell,
    FormatDatePipe,
  ],
  templateUrl: './task-list-card.component.html',
  styleUrl: './task-list-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListCardComponent {
  private readonly dialogs = inject(TuiDialogService);
  readonly settings = inject(Settings);
  readonly task = input.required<Task>();
  readonly showCategory = input<boolean>(true);
  readonly strikeThrough = input<boolean>(true);
  readonly fullDateFormat = input<boolean>(false);

  readonly icon = computed(() => {
    return this.task().completedAt ? '@tui.circle-check' : '@tui.circle';
  });

  toggleTask(task: Task) {
    if (!task.completedAt && task.pinned) {
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Complete Task?',
          data: {
            content: `Mark "${task.title}" as complete and unpin it?`,
            yes: 'Complete & Unpin',
            no: 'Keep Pinned',
          },
        })
        .pipe(
          tap((response) => {
            Tasks.completeTask(task, response);
          }),
        )
        .subscribe();
    } else {
      Tasks.toggleTask(task);
    }
  }

  deleteTask() {
    Tasks.removeOne(this.task());
  }
}
