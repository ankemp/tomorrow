import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Task, Tasks } from '@tmrw/data-access';

@Component({
  selector: 'tw-bulk-complete-tasks-button',
  imports: [CommonModule, TuiButton],
  template: `
    <button
      appearance="flat-grayscale"
      size="m"
      tuiIconButton
      iconStart="@tui.check-check"
      type="button"
      (click)="completeAll(tasks())"
    >
      Complete All
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkCompleteTasksButtonComponent {
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  readonly tasks = input.required<Task[]>();

  completeAll(tasks: Task[]) {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Complete All Tasks?',
        appearance: 'action',
        data: {
          content: `This will mark ${tasks.length} tasks as complete. Are you sure?`,
          yes: 'Complete All',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          tasks.forEach((task) => {
            Tasks.completeTask(task);
          });
        }),
        switchMap(() => {
          return this.alerts.open('Tasks marked as complete', {
            appearance: 'success',
            icon: '@tui.check-check',
          });
        }),
      )
      .subscribe();
  }
}
