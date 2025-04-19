import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
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
import { isNotNil } from 'es-toolkit';

import { Settings, TASK_SORT_DEFAULT, TaskSort } from '@tmrw/data-access';

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
    '[attr.tuiElasticSticky]': 'sticky() ? "" : null',
  },
})
export class TaskListHeaderComponent {
  private readonly settings = inject(Settings);
  readonly sortSaveKey = input<string | null>(null);
  readonly icon = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly headerSize = input<TuiHeader['size']>('m');
  readonly sticky = input<boolean>(true);
  readonly canSort = input<boolean>(false);

  readonly sortMenuOpen = signal<boolean>(false);
  readonly sortChanged = output<TaskSort>();

  readonly hasIcon = computed(() => !!this.icon());
  readonly hasSubtitle = computed(() => !!this.subtitle());
  readonly sort = linkedSignal(() => {
    const saveKey = this.sortSaveKey();
    if (isNotNil(saveKey)) {
      const sort = this.settings.sort()[saveKey];
      if (isNotNil(sort)) {
        return sort;
      }
    }
    return TASK_SORT_DEFAULT;
  });
  readonly buttonSize = computed<TuiButton['size']>(() => {
    switch (this.headerSize()) {
      case 'xs':
      case 's':
      case 'm':
      case 'l':
      case 'xl':
        return this.headerSize() as TuiButton['size'];
      default:
        return 'm';
    }
  });

  readonly sortStateIcon = computed(() => {
    switch (this.sort()) {
      case 'date_desc':
        return '@tui.clock-arrow-down';
      case 'date_asc':
        return '@tui.clock-arrow-up';
      case 'priority_desc':
        return '@tui.arrow-down-0-1';
      case 'priority_asc':
        return '@tui.arrow-up-1-0';
      default:
        return '@tui.arrow-down-up';
    }
  });

  constructor() {
    effect(() => {
      this.sortChanged.emit(this.sort());
    });
  }

  setSort(sort: TaskSort) {
    const saveKey = this.sortSaveKey();
    if (isNotNil(saveKey)) {
      this.settings.updateSort(saveKey, sort);
    } else {
      this.sort.set(sort);
    }
    this.sortMenuOpen.set(false);
  }
}
