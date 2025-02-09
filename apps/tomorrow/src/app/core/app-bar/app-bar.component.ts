import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiPlatform } from '@taiga-ui/cdk';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';

import { Tasks } from '@tmrw/data-access';

@Component({
  selector: 'tw-app-bar',
  imports: [
    CommonModule,
    RouterModule,
    TuiButton,
    TuiTitle,
    TuiSkeleton,
    TuiAppBar,
    TuiPlatform,
  ],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBarComponent {
  taskCount = signal<number>(-1);
  showSearch = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const c = Tasks.getTodaysIncompleteTasks();
        this.taskCount.set(c.count());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }
}
