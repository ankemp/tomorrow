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
  icon = input<string>();
  title = input.required<string>();
  subtitle = input<string>();
  action = input<string>();

  actionClicked = output<void>();

  hasIcon = computed(() => !!this.icon());
  hasSubtitle = computed(() => !!this.subtitle());
  hasAction = computed(() => !!this.action());
}
