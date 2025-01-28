import { CommonModule, I18nPluralPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiAppearance, TuiSurface, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

@Component({
  selector: 'tw-category-card',
  imports: [
    CommonModule,
    I18nPluralPipe,
    TuiAppearance,
    TuiSurface,
    TuiTitle,
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
  tasks = input.required<any[]>();
  color = input<string>(); // TODO: make random color if not provided
  icon = input<string>('@tui.star');

  taskCount = computed(() => this.tasks().length);
}
