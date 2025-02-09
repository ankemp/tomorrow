import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { filter, map } from 'rxjs';

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
  ],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBarComponent {
  private readonly router = inject(Router);
  readonly taskCount = signal<number>(-1);
  readonly showSearch = signal<boolean>(false);
  readonly showBackButton = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects !== '/tasks/dashboard'),
    ),
  );

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
