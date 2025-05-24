import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiContext, TuiTime, TuiValueTransformer } from '@taiga-ui/cdk';
import { TuiAutoColorPipe, TuiLabel } from '@taiga-ui/core';
import {
  TUI_TIME_VALUE_TRANSFORMER,
  TuiChip,
  TuiDataListWrapper,
} from '@taiga-ui/kit';
import {
  TUI_TEXTFIELD_SIZE,
  TuiInputSliderModule,
  TuiInputTimeModule,
  tuiInputTimeOptionsProvider,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';

import { Settings } from '@tmrw/data-access';
import { FormatDurationPipe } from '@tmrw/ui/core';

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
  selector: 'tw-task-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiAutoColorPipe,
    TuiLabel,
    TuiChip,
    TuiDataListWrapper,
    TuiInputSliderModule,
    TuiInputTimeModule,
    TuiTextfieldControllerModule,
    TuiSelectModule,
    PreferencesCardComponent,
  ],
  providers: [
    FormatDurationPipe,
    {
      provide: TUI_TIME_VALUE_TRANSFORMER,
      useClass: TimeTransformer,
    },
    tuiInputTimeOptionsProvider({
      nativePicker: true,
    }),
    {
      provide: TUI_TEXTFIELD_SIZE,
      useValue: {
        size: 'm',
      },
    },
  ],
  template: `
    <tw-preferences-card title="Task" icon="@tui.clock">
      <label tuiLabel>
        Default Task Time
        <tui-input-time
          [ngModel]="settings.defaultReminderTime()"
          [mode]="settings.tuiTimeFormat()"
          [tuiTextfieldCleaner]="true"
          (ngModelChange)="settings.updateDefaultReminderTime($event)"
        >
          Choose a time
        </tui-input-time>
      </label>
      <label tuiLabel>
        Time Format
        <tui-select
          [ngModel]="settings.timeFormat()"
          (ngModelChange)="settings.updateTimeFormat($event)"
        >
          Select format
          <tui-data-list-wrapper *tuiDataList [items]="['12h', '24h']" />
        </tui-select>
      </label>
      <label tuiLabel>
        Default Time Until Due (minutes)
        <tui-input-slider
          [ngModel]="settings.defaultReminderTimeAfterCreation()"
          (ngModelChange)="
            settings.updateDefaultReminderTimeAfterCreation($event)
          "
          [min]="0"
          [max]="1440"
          [steps]="100"
          [segments]="12"
          [valueContent]="durationLabel"
        >
          Minutes Until Due
        </tui-input-slider>
      </label>
      <label tuiLabel>
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
      </label>
      <label tuiLabel>
        Default Task Category
        <tui-select
          [ngModel]="settings.defaultReminderCategory()"
          (ngModelChange)="settings.updateDefaultReminderCategory($event)"
          [valueContent]="reminderSelectTemplate"
        >
          Select Category
          <tui-data-list-wrapper
            *tuiDataList
            [items]="[null, 'Work', 'Personal', 'Shopping', 'Health']"
            [itemContent]="reminderValueTemplate"
          />
          <ng-template #reminderSelectTemplate let-item>
            <ng-container
              [ngTemplateOutlet]="reminderChipTemplate"
              [ngTemplateOutletContext]="{ $implicit: item, size: 'xxs' }"
            />
          </ng-template>
          <ng-template #reminderValueTemplate let-item>
            <ng-container
              [ngTemplateOutlet]="reminderChipTemplate"
              [ngTemplateOutletContext]="{ $implicit: item, size: 'xs' }"
            />
          </ng-template>
          <ng-template #reminderChipTemplate let-item let-size="size">
            @if (item) {
              <tui-chip
                [size]="size"
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
      </label>
      <label tuiLabel>
        Time Specificity
        <tui-select
          [ngModel]="settings.timeSpecificity()"
          (ngModelChange)="settings.updateTimeSpecificity($event)"
          [valueContent]="timeSpecificityValueTemplate"
        >
          Select Option
          <!-- TODO: add optional as an item, requires writing a custom validator for our date-picker -->
          <tui-data-list-wrapper
            *tuiDataList
            [items]="['always', 'never']"
            [itemContent]="timeSpecificityValueTemplate"
          />
          <ng-template #timeSpecificityValueTemplate let-item>
            <span style="text-transform: capitalize;">{{ item }}</span>
          </ng-template>
        </tui-select>
      </label>
      <label tuiLabel>
        Complete Tasks When Subtasks are Done
        <tui-select
          [ngModel]="settings.autoCompleteTasks()"
          (ngModelChange)="settings.updateAutoCompleteTasks($event)"
          [valueContent]="autoCompleteTasksValueTemplate"
        >
          Select Option
          <tui-data-list-wrapper
            *tuiDataList
            [items]="['always', 'never', 'ask']"
            [itemContent]="autoCompleteTasksValueTemplate"
          />
          <ng-template #autoCompleteTasksValueTemplate let-item>
            <span style="text-transform: capitalize;">{{ item }}</span>
          </ng-template>
        </tui-select>
      </label>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskPreferencesComponent {
  readonly settings = inject(Settings);

  constructor(private formatDurationPipe: FormatDurationPipe) {}

  readonly durationLabel = ({ $implicit }: TuiContext<number>): string => {
    const minutes = $implicit;
    return this.formatDurationPipe.transform(minutes);
  };
}
