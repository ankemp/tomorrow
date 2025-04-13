import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { TuiButton } from '@taiga-ui/core';

import { Task } from '@tmrw/data-access';

import { TaskService } from '../task.service';

@Component({
  selector: 'tw-bulk-complete-tasks-button',
  imports: [CommonModule, TuiButton],
  template: `
    <button
      appearance="flat-grayscale"
      [size]="size()"
      tuiIconButton
      iconStart="@tui.check-check"
      type="button"
      (click)="taskService.bulkCompleteTasks(tasks())"
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
  readonly taskService = inject(TaskService);
  readonly tasks = input.required<Task[]>();
  readonly size = input<TuiButton['size']>('m');
}
