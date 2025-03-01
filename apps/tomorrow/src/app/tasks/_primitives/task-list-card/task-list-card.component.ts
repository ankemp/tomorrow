import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TuiRipple, TuiSwipeActions } from '@taiga-ui/addon-mobile';
import {
  TuiAlertService,
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiDialogService,
  TuiIcon,
  TuiSurface,
  TuiTitle,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiChip, TuiFade } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Attachments, Settings, Task, Tasks } from '@tmrw/data-access';

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
  providers: [Attachments],
  templateUrl: './task-list-card.component.html',
  styleUrl: './task-list-card.component.css',
})
export class TaskListCardComponent {
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly attachmentsStore = inject(Attachments);
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

  deleteTask(task: Task) {
    // TODO: Deduplicate this code with the one in task.component.ts
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirm Deletion',
        data: {
          appearance: 'destructive',
          content: 'Delete this task permanently?',
          yes: 'Delete',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          this.attachmentsStore.clearAttachments();
          Tasks.removeOne({ id: task.id });
          this.router.navigate(['/tasks']);
        }),
        switchMap(() => {
          return this.alerts.open('Task deleted', {
            appearance: 'destructive',
            icon: '@tui.trash-2',
          });
        }),
      )
      .subscribe();
  }
}
