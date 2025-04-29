import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLabel } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';

import { Notifications, Settings } from '@tmrw/data-access';

import { Context } from '../../core/context.store';
import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-notification-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiLabel,
    TuiSwitch,
    PreferencesCardComponent,
  ],
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
export class NotificationPreferencesComponent {
  readonly context = inject(Context);
  readonly settings = inject(Settings);
  readonly notifications = inject(Notifications);

  // TODO: Notifications can only be enabled if: Sync is turned on, and if the admin has generated the key(s)
}
