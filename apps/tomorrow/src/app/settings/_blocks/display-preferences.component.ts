import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TUI_DARK_MODE, TuiIcon, TuiLabel } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSegmented } from '@taiga-ui/kit';
import { TUI_TEXTFIELD_SIZE, TuiSelectModule } from '@taiga-ui/legacy';

import { Settings } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-display-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiIcon,
    TuiLabel,
    TuiDataListWrapper,
    TuiSegmented,
    TuiSelectModule,
    PreferencesCardComponent,
  ],
  providers: [
    {
      provide: TUI_TEXTFIELD_SIZE,
      useValue: {
        size: 'm',
      },
    },
  ],
  template: `
    <tw-preferences-card title="Display" icon="@tui.palette">
      <div class="switch-container">
        <label tuiLabel>
          Theme

          <tui-segmented [activeItemIndex]="darkModeIndex()">
            <button
              title="light"
              type="button"
              (click)="darkMode.set(!darkMode())"
            >
              <tui-icon icon="@tui.sun" />
            </button>
            <button
              title="dark"
              type="button"
              (click)="darkMode.set(!darkMode())"
            >
              <tui-icon icon="@tui.moon" />
            </button>
          </tui-segmented>
        </label>
        <label tuiLabel>
          Category Display
          <tui-select
            [ngModel]="settings.categoryDisplay()"
            (ngModelChange)="settings.updateCategoryDisplay($event)"
            [valueContent]="categoryDisplayValueTemplate"
          >
            Selected display mode
            <tui-data-list-wrapper
              *tuiDataList
              [items]="['name', 'icon', 'name_and_icon']"
              [itemContent]="categoryDisplayValueTemplate"
            />
            <ng-template #categoryDisplayValueTemplate let-item>
              <span style="text-transform: capitalize;">
                {{ item.replaceAll('_', ' ') }}
              </span>
            </ng-template>
          </tui-select>
        </label>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayPreferencesComponent {
  readonly darkMode = inject(TUI_DARK_MODE);
  readonly settings = inject(Settings);

  readonly darkModeIndex = computed(() => {
    return this.darkMode() ? 1 : 0;
  });
}
