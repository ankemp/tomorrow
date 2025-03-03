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
import { TuiContext } from '@taiga-ui/cdk';
import { TuiKeySteps } from '@taiga-ui/kit';
import { TuiInputSliderModule } from '@taiga-ui/legacy';

import { FormatDurationPipe } from '../../_primitives/format-duration.pipe';

@Component({
  selector: 'tw-duration',
  imports: [CommonModule, FormsModule, TuiInputSliderModule],
  templateUrl: './duration.component.html',
  styleUrl: './duration.component.less',
  providers: [
    FormatDurationPipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DurationComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationComponent implements ControlValueAccessor {
  readonly duration = signal<number | null>(null);

  readonly disabled = signal(false);

  constructor(private formatDurationPipe: FormatDurationPipe) {
    effect(() => {
      this._onChange(this.duration());
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  writeValue(input: any): void {
    this.duration.set(input);
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

  readonly durationLabel = ({ $implicit }: TuiContext<number>): string => {
    const minutes = $implicit;
    return this.formatDurationPipe.transform(minutes);
  };

  readonly tickLabels = [
    '0',
    '5m',
    '10m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '8h',
    '12h',
    '16h',
    '20h',
    '24h',
  ];

  readonly keySteps: TuiKeySteps = [
    // [percent, value in minutes]
    [0, 0],
    [Math.round((100 / 12) * 1), 5],
    [Math.round((100 / 12) * 2), 10],
    [Math.round((100 / 12) * 3), 15],
    [Math.round((100 / 12) * 4), 30],
    [Math.round((100 / 12) * 5), 60],
    [Math.round((100 / 12) * 6), 60 * 2],
    [Math.round((100 / 12) * 7), 60 * 4],
    [Math.round((100 / 12) * 8), 60 * 8],
    [Math.round((100 / 12) * 9), 60 * 12],
    [Math.round((100 / 12) * 10), 60 * 16],
    [Math.round((100 / 12) * 11), 60 * 20],
    [100, 60 * 24],
  ];
}
