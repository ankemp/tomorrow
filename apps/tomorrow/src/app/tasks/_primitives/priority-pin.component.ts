import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiChip, TuiPin } from '@taiga-ui/kit';

@Component({
  selector: 'tw-priority-pin',
  imports: [CommonModule, TuiChip],
  template: `
    <tui-chip [size]="size()" [style.background-color]="color()">{{
      label()
    }}</tui-chip>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: row;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityPinComponent {
  readonly priority = input.required<number>();
  readonly size = input<TuiChip['size']>('xs');

  readonly color = computed(() => {
    const priority = this.priority();
    if (priority) {
      if (priority === 1) {
        return 'var(--tui-status-positive)';
      } else if (priority > 1 && priority <= 50) {
        return 'var(--tui-status-warning)';
      } else if (priority > 50) {
        return 'var(--tui-status-negative)';
      }
    }
    return 'var(--tui-text-default)';
  });

  readonly label = computed(() => {
    const priority = this.priority();
    if (priority) {
      if (priority === 1) {
        return 'Low';
      } else if (priority > 1 && priority <= 50) {
        return 'Medium';
      } else if (priority > 50) {
        return 'High';
      }
    }
    return '';
  });
}
