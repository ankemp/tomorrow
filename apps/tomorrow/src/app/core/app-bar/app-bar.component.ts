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
import {
  TuiButton,
  TuiNotification,
  tuiSlideInBottom,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { filter, map } from 'rxjs';

import { Search, Settings, Tasks } from '@tmrw/data-access';

import { Context } from '../context.store';

@Component({
  selector: 'tw-app-bar',
  imports: [
    CommonModule,
    RouterModule,
    TuiButton,
    TuiNotification,
    TuiTitle,
    TuiSkeleton,
    TuiAppBar,
  ],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [tuiSlideInBottom],
})
export class AppBarComponent {
  private readonly router = inject(Router);
  readonly search = inject(Search);
  readonly settings = inject(Settings);
  readonly context = inject(Context);
  readonly taskCount = signal<number>(-1);
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
