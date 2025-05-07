import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TuiChip, TuiRadio } from '@taiga-ui/kit';

import { PriorityPinComponent } from '../../_primitives/priority-pin.component';

@Component({
  selector: 'tw-priority-selector',
  imports: [CommonModule, FormsModule, TuiChip, TuiRadio, PriorityPinComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PrioritySelectorComponent),
      multi: true,
    },
  ],
  templateUrl: './priority-selector.component.html',
  styleUrl: './priority-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrioritySelectorComponent implements ControlValueAccessor {
  readonly priority = signal<number>(0);
  readonly disabled = signal(false);

  /* eslint-disable @typescript-eslint/no-empty-function */
  private _onChange = (_: any) => {};
  private _onTouched = (_: any) => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor() {
    effect(() => {
      this._onChange(this.priority());
      this._onTouched(this.priority());
    });
  }

  writeValue(input: number): void {
    this.priority.set(input);
  }
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: (_: any) => void): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
