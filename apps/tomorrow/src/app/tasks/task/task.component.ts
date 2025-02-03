import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiAppearance, TuiAutoColorPipe } from '@taiga-ui/core';
import { TuiBadge, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { format } from 'date-fns';

import { Settings, Task, Tasks } from '@tmrw/data-access';

@Component({
  selector: 'tw-task',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiBadge,
    TuiChip,
    TuiCardLarge,
    TuiHeader,
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  settings = inject(Settings);
  task = signal<Task | null>(null);

  taskExists = computed(() => {
    return !!this.task();
  });

  date = computed(() => {
    const date = this.task()?.date;
    if (!date) {
      return '';
    }
    return `${format(date, 'EEE, d MMM')}, ${format(date, this.settings.dateFnsTimeFormat())}`;
  });

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    private activatedRoute: ActivatedRoute,
  ) {
    if (isPlatformBrowser(platformId)) {
      effect(() => {
        const t = Tasks.getTaskById(this.activatedRoute.snapshot.params['id']);
        if (t) {
          this.task.set(t);
        } else {
          // TODO: Redirect to 404
        }
      });
    }
  }
}
