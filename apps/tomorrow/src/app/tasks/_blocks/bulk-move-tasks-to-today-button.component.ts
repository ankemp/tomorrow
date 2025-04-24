import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogService } from '@taiga-ui/core';
import { TUI_CONFIRM } from '@taiga-ui/kit';
import { DateValues, set } from 'date-fns';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Settings, Tasks } from '@tmrw/data-access';
import { Task } from '@tmrw/data-access-models';

@Component({
  selector: 'tw-bulk-move-tasks-to-today-button',
  imports: [CommonModule, TuiButton],
  template: `
    <button
      appearance="flat-grayscale"
      [size]="size()"
      tuiIconButton
      iconStart="@tui.redo-dot"
      type="button"
      (click)="moveToToday(tasks())"
    >
      Move to Today
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkMoveTasksToTodayButtonComponent {
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly settings = inject(Settings);
  readonly tasks = input.required<Task[]>();
  readonly size = input<TuiButton['size']>('m');

  moveToToday(tasks: Task[]) {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Move Overdue Tasks?',
        appearance: 'action',
        data: {
          content: `This will move ${tasks.length} overdue tasks to today. Are you sure?`,
          yes: 'Move Tasks',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          const [hours, minutes] = this.settings
            .defaultReminderTime()
            .split(':')
            .map(Number);
          const dateValues: DateValues = {
            hours,
            minutes,
            seconds: 0,
            milliseconds: 0,
          };
          const today = set(new Date(), dateValues);
          tasks.forEach((task) => {
            Tasks.updateDate(task, today);
          });
        }),
        switchMap(() => {
          return this.alerts.open('Tasks moved to today', {
            appearance: 'success',
            icon: '@tui.redo-dot',
          });
        }),
      )
      .subscribe();
  }
}
