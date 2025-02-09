import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  model,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TuiAutoColorPipe } from '@taiga-ui/core';
import { TuiChip } from '@taiga-ui/kit';
import { TuiRadio } from '@taiga-ui/kit';

import { Settings } from '@tmrw/data-access';

@Component({
  selector: 'tw-category-selector',
  imports: [CommonModule, FormsModule, TuiAutoColorPipe, TuiChip, TuiRadio],
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategorySelectorComponent implements ControlValueAccessor {
  private settings = inject(Settings);
  category = model<string | null>();

  disabled = signal(false);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  constructor() {
    effect(() => {
      this._onChange(this.category());
    });
  }

  writeValue(input: string | null): void {
    if (input) {
      this.category.set(input);
    } else {
      const defaultCategory = this.settings.defaultReminderCategory();
      if (defaultCategory) {
        this.category.set(defaultCategory);
      }
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
