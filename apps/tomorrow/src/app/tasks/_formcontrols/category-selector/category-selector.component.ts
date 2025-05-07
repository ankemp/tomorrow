import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TuiAutoColorPipe } from '@taiga-ui/core';
import { TuiChip, TuiRadio } from '@taiga-ui/kit';

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
  private readonly settings = inject(Settings);
  readonly category = signal<string | null>(null);

  readonly disabled = signal(false);

  private _onChange!: (_: any) => void;
  private _onTouched!: (_: any) => void;

  constructor() {
    effect(() => {
      this._onChange(this.category());
      this._onTouched(this.category());
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
