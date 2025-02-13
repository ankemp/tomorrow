import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiAppearance, TuiAutoColorPipe } from '@taiga-ui/core';
import { TuiAvatar, TuiAvatarLabeled } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

import { Settings } from '@tmrw/data-access';

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
    TuiAvatar,
    TuiAvatarLabeled,
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
}
