import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  TuiAlertService,
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiIcon,
} from '@taiga-ui/core';
import {
  TuiAvatar,
  TuiAvatarLabeled,
  TuiBadge,
  TuiBadgedContent,
  TuiButtonLoading,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

import { Settings, syncManager } from '@tmrw/data-access';

import { DevicePreferencesComponent } from '../_blocks/device-preferences.component';
import { DisplayPreferencesComponent } from '../_blocks/display-preferences.component';
import { NotificationPreferencesComponent } from '../_blocks/notification-preferences.component';
import { ReminderPreferencesComponent } from '../_blocks/reminder-preferences.component';
import { SyncPreferencesComponent } from '../_blocks/sync-preferences.component';

@Component({
  selector: 'tw-general',
  imports: [
    CommonModule,
    RouterModule,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiIcon,
    TuiAvatar,
    TuiAvatarLabeled,
    TuiBadge,
    TuiBadgedContent,
    TuiButtonLoading,
    TuiCardLarge,
    TuiCell,
    DevicePreferencesComponent,
    DisplayPreferencesComponent,
    NotificationPreferencesComponent,
    ReminderPreferencesComponent,
    SyncPreferencesComponent,
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralComponent {
  readonly settings = inject(Settings);
  readonly alerts = inject(TuiAlertService);
  readonly syncManager = syncManager;

  async forceSync() {
    await syncManager.syncAll();
    this.alerts
      .open('All data synced', {
        appearance: 'success',
        icon: '@tui.check-circle',
      })
      .subscribe();
  }
}
