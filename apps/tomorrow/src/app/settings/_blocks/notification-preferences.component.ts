import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiLabel } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-notification-preferences',
  imports: [CommonModule, TuiLabel, TuiSwitch, PreferencesCardComponent],
  template: `
    <tw-preferences-card title="Notifications" icon="@tui.bell">
      <div class="switch-container">
        <label tuiLabel>
          Push Notifications
          <input tuiSwitch type="checkbox" />
        </label>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPreferencesComponent {}
