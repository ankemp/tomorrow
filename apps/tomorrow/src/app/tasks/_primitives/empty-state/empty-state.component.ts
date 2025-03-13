import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  TuiAppearance,
  TuiButton,
  TuiIcon,
  TuiSizeL,
  TuiSizeS,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';

@Component({
  selector: 'tw-empty-state',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiButton,
    TuiIcon,
    TuiTitle,
    TuiSkeleton,
    TuiCell,
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly action = input<string>();
  readonly skeleton = input<boolean>(false);
  readonly size = input<TuiSizeL | TuiSizeS>('l');

  readonly actionClicked = output<void>();

  readonly hasIcon = computed(() => !!this.icon());
  readonly hasSubtitle = computed(() => !!this.subtitle());
  readonly hasAction = computed(() => !!this.action());
}
