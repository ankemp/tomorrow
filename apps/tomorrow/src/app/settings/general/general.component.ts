import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

import { Settings } from '@tmrw/data-access';

import { DisplayPreferencesComponent } from '../_blocks/display-preferences.component';
import { NotificationPreferencesComponent } from '../_blocks/notification-preferences.component';
import { ReminderPreferencesComponent } from '../_blocks/reminder-preferences.component';
import { SyncPreferencesComponent } from '../_blocks/sync-preferences.component';

@Component({
  selector: 'tw-general',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiAvatar,
    TuiCardLarge,
    TuiCell,
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
  settings = inject(Settings);
}
