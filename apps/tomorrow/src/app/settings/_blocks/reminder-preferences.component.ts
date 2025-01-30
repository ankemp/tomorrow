import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiLabel } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-reminder-preferences',
  imports: [CommonModule, TuiLabel, TuiSwitch, PreferencesCardComponent],
  template: `
    <tw-preferences-card title="Reminder Preferences" icon="@tui.clock">
      <div class="switch-container">
        <label tuiLabel>
          Default Reminder Time
          <input tuiSwitch type="checkbox" />
        </label>
        <label tuiLabel>
          Start of Week
          <input tuiSwitch type="checkbox" />
        </label>
        <label tuiLabel>
          Time Format
          <input tuiSwitch type="checkbox" />
        </label>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderPreferencesComponent {}
