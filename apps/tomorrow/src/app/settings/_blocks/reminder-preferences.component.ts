import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLabel } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiSelectModule } from '@taiga-ui/legacy';

import { Settings } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-reminder-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiLabel,
    TuiSwitch,
    TuiDataListWrapper,
    TuiSelectModule,
    PreferencesCardComponent,
  ],
  template: `
    <tw-preferences-card title="Reminder Preferences" icon="@tui.clock">
      <div class="switch-container">
        <label tuiLabel>
          Default Reminder Time
          <input tuiSwitch type="checkbox" />
        </label>
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
