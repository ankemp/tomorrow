import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { TuiElasticSticky } from '@taiga-ui/addon-mobile';
import {
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiIcon,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

import { SORT_DEFAULT, TaskSort } from '@tmrw/data-access';

@Component({
  selector: 'tw-task-list-header',
  imports: [
    CommonModule,
    TuiElasticSticky,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiHeader,
    TuiIcon,
    TuiTitle,
  ],
  templateUrl: './task-list-header.component.html',
  styleUrl: './task-list-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sticky]': 'sticky()',
    '[attr.tuiElasticSticky]': 'sticky() ? "" : null',
  },
})
export class TaskListHeaderComponent {
  readonly icon = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly headerSize = input<TuiHeader['size']>('m');
  readonly sticky = input<boolean>(true);
  readonly canSort = input<boolean>(false);

  readonly sortChanged = output<TaskSort>();

  readonly sortMenuOpen = model<boolean>(false);
  readonly sortState = signal<TaskSort>(SORT_DEFAULT);

  readonly hasIcon = computed(() => !!this.icon());
  readonly hasSubtitle = computed(() => !!this.subtitle());
  readonly sortStateIcon = computed(() => {
    switch (this.sortState()) {
      case 'date_desc':
        return '@tui.clock-arrow-down';
      case 'date_asc':
        return '@tui.clock-arrow-up';
      case 'priority_desc':
        return '@tui.arrow-down-0-1';
      case 'priority_asc':
        return '@tui.arrow-up-1-0';
    }
  });

  constructor() {
    effect(() => {
      this.sortChanged.emit(this.sortState());
    });
  }

  setSort(sort: TaskSort) {
    this.sortState.set(sort);
    this.sortMenuOpen.set(false);
  }
}
