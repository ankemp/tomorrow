import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TuiIcon } from '@taiga-ui/core';
import { TuiSegmented } from '@taiga-ui/kit';

import { Settings } from '@tmrw/data-access';
import { Context } from '@tmrw/ui/core';

@Component({
  selector: 'tw-reminder-toggle',
  imports: [CommonModule, TuiIcon, TuiSegmented],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReminderToggleComponent),
      multi: true,
    },
  ],
  templateUrl: './reminder-toggle.component.html',
  styleUrl: './reminder-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderToggleComponent implements ControlValueAccessor {
  readonly context = inject(Context);
  readonly settings = inject(Settings);
  readonly reminderEnabled = signal<boolean>(false);
  readonly disabled = signal(false);

  private _onChange!: (_: any) => void;
  private _onTouched!: () => void;

  constructor() {
    effect(() => {
      this._onChange(this.reminderEnabled());
      this._onTouched();
    });
  }

  writeValue(input: boolean): void {
    this.reminderEnabled.set(input);
  }
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
