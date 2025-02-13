import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
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
import { TUI_DATE_TIME_VALUE_TRANSFORMER, TuiChip } from '@taiga-ui/kit';
import { TuiInputDateTimeModule } from '@taiga-ui/legacy';
import { addDays, DateValues, nextSaturday, set } from 'date-fns';

import { Settings } from '@tmrw/data-access';

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

@Component({
  selector: 'tw-date-picker',
  imports: [
    CommonModule,
    FormsModule,
    TuiAppearance,
    TuiChip,
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

  readonly datePickerPreset = model<
    'today' | 'tomorrow' | 'weekend' | 'custom' | null
  >(null);
  readonly showDatePicker = computed(() => {
    return !!this.datePickerPreset();
  });

  readonly date = model<Date | null>(null);

  readonly disabled = signal(false);

  constructor() {
    effect(() => {
      const preset = this.datePickerPreset();
      const defaultReminderTime = this.settings.defaultReminderTime();
      const today = new Date();
      const [hours, minutes] = defaultReminderTime
        ? defaultReminderTime.split(':').map(Number)
        : [0, 0];
      const dateValues: DateValues = {
        hours,
        minutes,
        seconds: 0,
        milliseconds: 0,
      };

      switch (preset) {
        case 'today':
          this.date.set(set(today, dateValues));
          break;
        case 'tomorrow':
          this.date.set(set(addDays(today, 1), dateValues));
          break;
        case 'weekend':
          this.date.set(set(nextSaturday(today), dateValues));
          break;
        case 'custom':
          this.date.set(set(today, dateValues));
          break;
      }
    });
    effect(() => {
      this._onChange(this.date());
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  writeValue(input: Date | null): void {
    this.date.set(input);
    if (this.showPresets() && !!input) {
      this.datePickerPreset.set('custom');
    } else if (input === null) {
      this.datePickerPreset.set(null);
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
