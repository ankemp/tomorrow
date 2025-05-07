import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TuiDay, TuiTime, TuiValueTransformer } from '@taiga-ui/cdk';
import {
  TUI_FIRST_DAY_OF_WEEK,
  TuiAppearance,
  tuiDateFormatProvider,
} from '@taiga-ui/core';
import {
  TUI_DATE_TIME_VALUE_TRANSFORMER,
  TUI_DATE_VALUE_TRANSFORMER,
  TuiChip,
} from '@taiga-ui/kit';
import { TuiInputDateModule, TuiInputDateTimeModule } from '@taiga-ui/legacy';
import {
  addDays,
  addMinutes,
  DateValues,
  isAfter,
  nextSaturday,
  set,
} from 'date-fns';

import { Settings } from '@tmrw/data-access';
import { SettingsState } from '@tmrw/data-access-models';

class DateTimeTransformer extends TuiValueTransformer<
  [TuiDay | null, TuiTime | null],
  Date | null
> {
  fromControlValue(controlValue: Date | null): [TuiDay | null, TuiTime | null] {
    if (!controlValue) {
      return [null, null];
    }
    const day = TuiDay.fromLocalNativeDate(controlValue);
    const time = TuiTime.fromLocalNativeDate(controlValue);

    return [day, time];
  }

  toControlValue(value: [TuiDay | null, TuiTime | null]) {
    if (!value) {
      return null;
    }
    const [day, time] = value;
    if (!day || !time) {
      return null;
    }

    const date = day.toLocalNativeDate();
    if (time) {
      date.setHours(time.hours, time.minutes, time.seconds);
    }

    return date;
  }
}

class DateTransformer extends TuiValueTransformer<TuiDay | null, Date | null> {
  fromControlValue(controlValue: Date | null): TuiDay | null {
    return controlValue ? TuiDay.fromLocalNativeDate(controlValue) : null;
  }

  toControlValue(value: TuiDay | null): Date | null {
    return value ? value.toLocalNativeDate() : null;
  }
}

@Component({
  selector: 'tw-date-picker',
  imports: [
    CommonModule,
    FormsModule,
    TuiAppearance,
    TuiChip,
    TuiInputDateModule,
    TuiInputDateTimeModule,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
    {
      provide: TUI_DATE_TIME_VALUE_TRANSFORMER,
      useClass: DateTimeTransformer,
    },
    {
      provide: TUI_DATE_VALUE_TRANSFORMER,
      useClass: DateTransformer,
    },
    {
      provide: TUI_FIRST_DAY_OF_WEEK,
      useFactory: () => inject(Settings).tuiFirstDayOfWeek(),
    },
    tuiDateFormatProvider({ mode: 'MDY', separator: '/' }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly settings = inject(Settings);
  readonly showPresets = input(true);
  readonly specificityOverride = input<SettingsState['timeSpecificity'] | null>(
    null,
  );

  readonly datePickerPreset = signal<
    'today' | 'tomorrow' | 'weekend' | 'custom' | null
  >(null);
  readonly showDatePicker = computed(() => {
    return !!this.datePickerPreset();
  });

  readonly date = signal<Date | null>(null);
  readonly disabled = signal(false);

  readonly timeSpecificity = computed(() => {
    return this.specificityOverride() || this.settings.timeSpecificity();
  });

  /* eslint-disable @typescript-eslint/no-empty-function */
  private _onChange = (_: any) => {};
  private _onTouched = () => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor() {
    effect(() => {
      if (this.showPresets()) {
        const preset = this.datePickerPreset();
        const today = new Date();
        const [hours, minutes] = this.settings
          .defaultReminderTime()
          .split(':')
          .map(Number);
        const dateValues: DateValues = {
          hours,
          minutes,
          seconds: 0,
          milliseconds: 0,
        };

        switch (preset) {
          case 'today': {
            let setValue = set(today, dateValues);
            if (isAfter(today, setValue)) {
              setValue = addMinutes(
                today,
                this.settings.defaultReminderTimeAfterCreation(),
              );
            }
            this.date.set(setValue);
            break;
          }
          case 'tomorrow': {
            this.date.set(set(addDays(today, 1), dateValues));
            break;
          }
          case 'weekend': {
            this.date.set(set(nextSaturday(today), dateValues));
            break;
          }
        }
      } else {
        this.datePickerPreset.set('custom');
      }
      this._onTouched();
    });
    effect(() => {
      this._onChange(this.date());
      this._onTouched();
    });
  }

  writeValue(input: Date | null): void {
    this.date.set(input);
    if (this.showPresets() && !!input) {
      this.datePickerPreset.set('custom');
    } else if (input === null) {
      this.datePickerPreset.set(null);
    }
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
