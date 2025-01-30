import {
  CommonModule,
  I18nPluralPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiAppearance, TuiSurface, TuiTitle } from '@taiga-ui/core';
import { TuiAutoColorPipe } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

import { Tasks } from '@tmrw/data-access';

@Component({
  selector: 'tw-category-card',
  imports: [
    CommonModule,
    RouterModule,
    I18nPluralPipe,
    TuiAppearance,
    TuiSurface,
    TuiTitle,
    TuiAutoColorPipe,
    TuiSkeleton,
    TuiAvatar,
    TuiCardLarge,
    TuiCell,
  ],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCardComponent {
  title = input.required<string>();
  color = input<string>();
  icon = input<string>('@tui.star');

  taskCount = signal<number>(-1);

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const c = Tasks.getByCategory(this.title());
        this.taskCount.set(c.count());
        onCleanup(() => {
          c.cleanup();
        });
      });
    }
  }
}
