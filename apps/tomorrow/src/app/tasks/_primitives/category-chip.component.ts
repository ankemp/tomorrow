import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  SkipSelf,
} from '@angular/core';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { TUI_ICON_RESOLVER, TuiAutoColorPipe, TuiIcon } from '@taiga-ui/core';
import { TuiChip } from '@taiga-ui/kit';

import { Settings } from '@tmrw/data-access';

// TODO: Move to some shared place so category-card can use it
const CATEGORY_ICONS: { [key: string]: string } = {
  Work: '@tui.briefcase-business',
  Personal: '@tui.user',
  Shopping: '@tui.shopping-cart',
  Health: '@tui.heart-pulse',
};

@Component({
  selector: 'tw-category-chip',
  standalone: true,
  imports: [CommonModule, TuiIcon],
  providers: [
    TuiAutoColorPipe,
    {
      provide: TUI_ICON_RESOLVER,
      deps: [[new SkipSelf(), TUI_ICON_RESOLVER]],
      useFactory(defaultResolver: TuiStringHandler<string>) {
        return (name: string) =>
          name.startsWith('@tui.')
            ? defaultResolver(name)
            : defaultResolver(CATEGORY_ICONS[name]);
      },
    },
  ],
  template: `
    @if (showIcon()) {
      <tui-icon [icon]="category()" />
    }
    @if (showName()) {
      {{ category() }}
    }
  `,
  hostDirectives: [
    {
      directive: TuiChip,
      inputs: ['size'],
    },
  ],
  host: {
    tuiChip: '',
    '[style.background-color]': 'categoryColor()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryChipComponent {
  readonly settings = inject(Settings);
  readonly autoColor = inject(TuiAutoColorPipe);
  readonly category = input.required<string>();

  readonly categoryColor = computed(() => {
    return this.autoColor.transform(this.category());
  });

  readonly showIcon = computed(() => {
    return (
      this.settings.categoryDisplay() === 'icon' ||
      this.settings.categoryDisplay() === 'name_and_icon'
    );
  });
  readonly showName = computed(() => {
    return (
      this.settings.categoryDisplay() === 'name' ||
      this.settings.categoryDisplay() === 'name_and_icon'
    );
  });
}
