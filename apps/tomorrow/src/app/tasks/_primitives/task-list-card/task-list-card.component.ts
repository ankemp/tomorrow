import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { TuiSwipeActions } from '@taiga-ui/addon-mobile';
import {
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiSurface,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiChip, TuiFade } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { format, isFuture, isTomorrow } from 'date-fns';

import { Settings, Task, Tasks } from '@tmrw/data-access';

@Component({
  selector: 'tw-task-list-card',
  imports: [
    CommonModule,
    TuiSwipeActions,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiSurface,
    TuiTitle,
    TuiChip,
    TuiFade,
    TuiCell,
  ],
  templateUrl: './task-list-card.component.html',
  styleUrl: './task-list-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListCardComponent {
  settings = inject(Settings);
  task = input.required<Task>();
  showCategory = input<boolean>(true);

  icon = computed(() => {
    return this.task().completedAt ? '@tui.circle-check' : '@tui.circle';
  });

  dateString = computed(() => {
    const date = this.task().date;
    if (isFuture(date)) {
      if (isTomorrow(date)) {
        return `Tomorrow, ${format(date, this.settings.dateFnsTimeFormat())}`;
      }
      return `${format(date, 'EEE, d MMM')}, ${format(date, this.settings.dateFnsTimeFormat())}`;
    }
    return format(date, this.settings.dateFnsTimeFormat());
  });

  toggleTask() {
    Tasks.toggleTask(this.task());
  }

  deleteTask() {
    Tasks.removeOne(this.task());
  }
}
