import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TuiProgress, TuiProgressLabel } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { NgMathPipesModule } from 'ngx-pipes';

import { Attachments } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-device-preferences',
  imports: [
    CommonModule,
    TuiIcon,
    TuiProgress,
    TuiProgressLabel,
    TuiCell,
    NgMathPipesModule,
    PreferencesCardComponent,
  ],
  providers: [Attachments],
  template: `
    <tw-preferences-card title="Device" icon="@tui.smartphone">
      <div tuiCell>
        <label tuiProgressLabel>
          <tui-icon
            icon="@tui.hard-drive"
            [style.color]="'var(--tui-background-accent-1)'"
          />
          <tui-progress-circle
            size="s"
            [value]="attachmentsStore.fsUsagePercent()"
          />
        </label>
        <div tuiTitle>
          {{ attachmentsStore.fsUsage() | bytes: 2 }} of
          {{ attachmentsStore.fsQuota() | bytes: 0 }}
        </div>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicePreferencesComponent {
  readonly attachmentsStore = inject(Attachments);
}
