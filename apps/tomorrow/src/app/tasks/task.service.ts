import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TuiAlertService, TuiDialogService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Attachments, Settings, Task, Tasks } from '@tmrw/data-access';

@Injectable()
export class TaskService {
  readonly router = inject(Router);
  readonly dialogs = inject(TuiDialogService);
  readonly alerts = inject(TuiAlertService);
  readonly settings = inject(Settings);
  readonly attachmentsStore = inject(Attachments);

  toggleSubtask(task: Task, subtaskIndex: number) {
    const completedCount = task.subTasks.filter((t) => t.completedAt).length;
    const subTaskAlreadyCompleted =
      !!task.subTasks.at(subtaskIndex)?.completedAt;
    Tasks.toggleSubtask(task, subtaskIndex);
    if (
      !subTaskAlreadyCompleted &&
      completedCount + 1 === task.subTasks.length &&
      !task.completedAt
    ) {
      if (this.settings.autoCompleteTasks() === 'ask') {
        this.dialogs
          .open<boolean>(TUI_CONFIRM, {
            label: 'Complete Task?',
            data: {
              content: `All subtasks are complete. Mark "${task.title}" as complete?`,
              yes: 'Mark Complete',
              no: 'Cancel',
            },
          })
          .pipe(
            switchMap((response) => (response ? of(true) : EMPTY)),
            tap(() => {
              this.toggleTask(task);
            }),
          )
          .subscribe();
      } else if (this.settings.autoCompleteTasks() === 'always') {
        this.toggleTask(task);
      }
    }
  }

  toggleTask(task: Task) {
    const isCompleted = !!task.completedAt;
    const alertMessage = isCompleted
      ? 'Task marked incomplete'
      : 'Task completed';
    const alertAppearance = isCompleted ? 'destructive' : 'success';
    const alertIcon = isCompleted ? '@tui.circle-slash' : '@tui.circle-check';

    if (!isCompleted && task.pinned) {
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
          switchMap(() => {
            return this.alerts.open(alertMessage, {
              appearance: alertAppearance,
              icon: alertIcon,
            });
          }),
        )
        .subscribe();
    } else {
      Tasks.toggleTask(task);
      this.alerts
        .open(alertMessage, {
          appearance: alertAppearance,
          icon: alertIcon,
        })
        .subscribe();
    }
  }

  pinTask(task: Task) {
    Tasks.pinTask(task);
    this.alerts
      .open(task.pinned ? 'Task unpinned' : 'Task pinned', {
        appearance: task.pinned ? 'destructive' : 'success',
        icon: task.pinned ? '@tui.pin-off' : '@tui.pin',
      })
      .subscribe();
  }

  deleteTask(task: Task) {
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
