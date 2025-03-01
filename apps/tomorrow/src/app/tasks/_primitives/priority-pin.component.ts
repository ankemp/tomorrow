import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiPin } from '@taiga-ui/kit';

@Component({
  selector: 'tw-priority-pin',
  imports: [CommonModule, TuiPin],
  template: `
    <tui-pin [style.background-color]="color()" />
    @if (showLabel()) {
      <span class="label">{{ label() }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: row;
    }

    tui-pin {
      left: var(--pin-left, 0);
      position: relative;
      top: var(--pin-top, 0);

      &.low {
        background-color: var(--tui-status-positive);
      }
      &.medium {
        background-color: var(--tui-status-warning);
      }
      &.high {
        background-color: var(--tui-status-negative);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityPinComponent {
  readonly priority = input.required<number>();
  readonly showLabel = input<boolean>(false);

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
