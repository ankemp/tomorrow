import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLabel, TuiNotification } from '@taiga-ui/core';
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
    TuiNotification,
    TuiSwitch,
    PreferencesCardComponent,
  ],
  template: `
    <tw-preferences-card title="Notifications" icon="@tui.bell">
      <div class="switch-container">
        @if (disabled()) {
          <tui-notification appearance="warning" size="s">
            {{ whyDisabled() }}
          </tui-notification>
        }
        <label tuiLabel>
          Push Notifications
          <input tuiSwitch type="checkbox" [disabled]="!enabled()" />
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

  readonly disabled = computed(() => {
    return (
      !this.notifications.swPushEnabled() ||
      !this.settings.remoteSync() ||
      !this.context.notificationsEnabled()
    );
  });
  readonly whyDisabled = computed(() => {
    if (!this.notifications.swPushEnabled()) {
      return 'Unsupported browser';
    }
    if (!this.settings.remoteSync()) {
      return 'Remote sync is disabled';
    }
    if (!this.context.notificationsEnabled()) {
      return 'Disabled server-side';
    }
    return 'Unknown reason';
  });
}
