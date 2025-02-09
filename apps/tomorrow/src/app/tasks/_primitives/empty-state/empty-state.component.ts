import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { TuiAppearance, TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCell } from '@taiga-ui/layout';

@Component({
  selector: 'tw-empty-state',
  imports: [CommonModule, TuiAppearance, TuiButton, TuiIcon, TuiTitle, TuiCell],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly action = input<string>();

  readonly actionClicked = output<void>();

  readonly hasIcon = computed(() => !!this.icon());
  readonly hasSubtitle = computed(() => !!this.subtitle());
  readonly hasAction = computed(() => !!this.action());
}
