import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTime, TuiValueTransformer } from '@taiga-ui/cdk';
import { TUI_TIME_VALUE_TRANSFORMER, TuiDataListWrapper } from '@taiga-ui/kit';
import {
  TuiInputTimeModule,
  tuiInputTimeOptionsProvider,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { TuiSelectModule } from '@taiga-ui/legacy';

import { Settings } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

class TimeTransformer extends TuiValueTransformer<
  TuiTime | null,
  string | null
> {
  public fromControlValue(controlValue: string): TuiTime | null {
    return controlValue ? TuiTime.fromString(controlValue) : null;
  }

  public toControlValue(time: TuiTime | null): string {
    return time ? time.toString() : '';
  }
}

@Component({
  selector: 'tw-reminder-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiDataListWrapper,
    TuiInputTimeModule,
    TuiTextfieldControllerModule,
    TuiSelectModule,
    PreferencesCardComponent,
  ],
  providers: [
    {
      provide: TUI_TIME_VALUE_TRANSFORMER,
      useClass: TimeTransformer,
    },
    tuiInputTimeOptionsProvider({
      nativePicker: true,
    }),
  ],
  template: `
    <tw-preferences-card title="Reminder Preferences" icon="@tui.clock">
      <div class="switch-container">
        <div tuiLabel>
          Default Reminder Time
          <tui-input-time
            [ngModel]="settings.defaultReminderTime()"
            [mode]="settings.tuiTimeFormat()"
            [tuiTextfieldCleaner]="true"
            (ngModelChange)="settings.updateDefaultReminderTime($event)"
          >
            Choose a time
          </tui-input-time>
        </div>
        <div tuiLabel>
          Start of Week
          <tui-select
            [ngModel]="settings.startOfWeek()"
            (ngModelChange)="settings.updateStartOfWeek($event)"
          >
            Select Day
            <tui-data-list-wrapper
              *tuiDataList
              [items]="[
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ]"
            />
          </tui-select>
        </div>
        <div tuiLabel>
          Time Format
          <tui-select
            [ngModel]="settings.timeFormat()"
            (ngModelChange)="settings.updateTimeFormat($event)"
          >
            Select format
            <tui-data-list-wrapper *tuiDataList [items]="['12h', '24h']" />
          </tui-select>
        </div>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderPreferencesComponent {
  settings = inject(Settings);
}
