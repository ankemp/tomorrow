import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TuiSheetDialogService } from '@taiga-ui/addon-mobile';
import { TuiAlertService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Attachments, Settings, Tasks } from '@tmrw/data-access';
import { Task, TaskTimer } from '@tmrw/data-access-models';

import { TimerUpdateComponent } from './_blocks/timer-update.component';

@Injectable()
export class TaskService {
  readonly router = inject(Router);
  readonly dialogs = inject(TuiSheetDialogService);
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
              no: 'Leave Incomplete',
            },
          })
          .pipe(
            switchMap((response) => (response ? of(true) : EMPTY)),
            tap(() => {
              this.toggleTask(task);
              this.router.navigate(['/tasks']);
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
            yes: 'Unpin',
            no: 'Keep Pinned',
          },
        })
        .pipe(
          tap((yesNoBoolean) => {
            Tasks.completeTask(task, !yesNoBoolean);
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

  bulkCompleteTasks(tasks: Task[]) {
    const count = tasks.length;
    const taskText = `task${count > 1 ? 's' : ''}`;
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Complete Tasks?',
        data: {
          content: `This will mark ${count} ${taskText} as complete. Are you sure?`,
          yes: 'Complete',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          // TODO: write a bulk complete function instead of iterating
          tasks.forEach((task) => {
            Tasks.completeTask(task);
          });
        }),
        switchMap(() => {
          return this.alerts.open(`${count} ${taskText} marked as complete`, {
            appearance: 'success',
            icon: '@tui.check-check',
          });
        }),
      )
      .subscribe();
  }

  startTimer(task: Task) {
    Tasks.startTimer(task);
  }

  stopTimer(task: Task, timerIndex: number) {
    Tasks.stopTimer(task, timerIndex);
  }

  toggleTimer(task: Task) {
    Tasks.toggleTimer(task);
  }

  removeTimer(task: Task, timerIndex: number) {
    Tasks.removeTimer(task, timerIndex);
  }

  togglePinTask(task: Task) {
    const isPinned = !!task.pinned;
    const alertMessage = isPinned ? 'Task unpinned' : 'Task pinned';
    const alertAppearance = isPinned ? 'destructive' : 'success';
    const alertIcon = isPinned ? '@tui.pin-off' : '@tui.pin';
    const count = Tasks.getPinnedTasks().count();
    if (count >= 3 && !isPinned) {
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Pin Limit Reached',
          data: {
            content: `You have ${count} pinned tasks. For better organization, consider using tags or priorities instead of adding more pins. Pin this task anyway?`,
            yes: 'Pin Anyway',
            no: 'Cancel',
          },
        })
        .pipe(
          switchMap((response) => (response ? of(true) : EMPTY)),
          tap(() => {
            Tasks.toggleTaskPin(task);
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
      Tasks.toggleTaskPin(task);
      this.alerts
        .open(alertMessage, {
          appearance: alertAppearance,
          icon: alertIcon,
        })
        .subscribe();
    }
  }

  bulkTogglePinTasks(tasks: Task[]) {
    const allPinned = tasks.every((task) => task.pinned);
    const allUnpinned = tasks.every((task) => !task.pinned);

    if (!allPinned && !allUnpinned) {
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Inconsistent Pin State',
          data: {
            content:
              'Some tasks are pinned and some are not. Please select tasks that can be toggled in the same direction.',
            yes: 'OK',
          },
        })
        .subscribe();
      return;
    }

    const count = tasks.length;
    const taskText = `task${count > 1 ? 's' : ''}`;
    const pinnedCount = Tasks.getPinnedTasks().count();

    if (pinnedCount + count > 3 && allUnpinned) {
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Pin Limit Reached',
          data: {
            content: `You have ${pinnedCount} pinned tasks. Adding ${count} more will exceed the limit. For better organization, consider using tags or priorities instead of adding more pins. Pin these tasks anyway?`,
            yes: 'Pin Anyway',
            no: 'Cancel',
          },
        })
        .pipe(
          switchMap((response) => (response ? of(true) : EMPTY)),
          tap(() => {
            Tasks.bulkTogglePinTasks(tasks);
          }),
          switchMap(() => {
            return this.alerts.open(`${count} ${taskText} pinned`, {
              appearance: 'success',
              icon: '@tui.pin',
            });
          }),
        )
        .subscribe();
    } else {
      Tasks.bulkTogglePinTasks(tasks);
      this.alerts
        .open(`${count} ${taskText} pinned`, {
          appearance: 'success',
          icon: '@tui.pin',
        })
        .subscribe();
    }
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

  bulkDeleteTasks(tasks: Task[]) {
    const count = tasks.length;
    const taskText = `task${count > 1 ? 's' : ''}`;
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirm Bulk Deletion',
        data: {
          appearance: 'destructive',
          content: `Delete ${count} ${taskText} permanently?`,
          yes: 'Delete',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          Tasks.removeMany({ ids: tasks.map((task) => task.id) });
        }),
        switchMap(() => {
          return this.alerts.open(`${count} ${taskText} deleted`, {
            appearance: 'destructive',
            icon: '@tui.trash-2',
          });
        }),
      )
      .subscribe();
  }

  openTimerEditDialog(task: Task, timerIndex: number): void {
    this.dialogs
      .open<TaskTimer>(new PolymorpheusComponent(TimerUpdateComponent), {
        label: `Edit Timer #${timerIndex + 1}`,
        data: {
          task,
          timerIndex,
        },
      })
      .pipe(
        tap((taskTimer) => {
          Tasks.updateTimer(task, timerIndex, taskTimer);
        }),
        switchMap(() => {
          return this.alerts.open('Timer updated', {
            appearance: 'success',
            icon: '@tui.timer',
          });
        }),
      )
      .subscribe();
  }
}
