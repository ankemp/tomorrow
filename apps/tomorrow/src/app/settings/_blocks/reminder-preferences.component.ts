import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTime, TuiValueTransformer } from '@taiga-ui/cdk';
import { TuiAutoColorPipe } from '@taiga-ui/core';
import {
  TUI_TIME_VALUE_TRANSFORMER,
  TuiChip,
  TuiDataListWrapper,
} from '@taiga-ui/kit';
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

// TODO: Add default reminder time-from-now if today
@Component({
  selector: 'tw-reminder-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiAutoColorPipe,
    TuiChip,
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
    <tw-preferences-card title="Reminder" icon="@tui.clock">
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
          Default Reminder Category
          <tui-select
            [ngModel]="settings.defaultReminderCategory()"
            (ngModelChange)="settings.updateDefaultReminderCategory($event)"
            [valueContent]="reminderValueTemplate"
          >
            Select Category
            <tui-data-list-wrapper
              *tuiDataList
              [items]="[null, 'Work', 'Personal', 'Shopping', 'Health']"
              [itemContent]="reminderValueTemplate"
            />
            <ng-template #reminderValueTemplate let-item>
              @if (item) {
                <tui-chip
                  size="xs"
                  appearance="custom"
                  [style.background-color]="item | tuiAutoColor"
                >
                  {{ item }}
                </tui-chip>
              } @else if (item === null) {
                No Default
              }
            </ng-template>
          </tui-select>
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
  readonly settings = inject(Settings);
}
