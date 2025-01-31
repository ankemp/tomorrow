import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLabel } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';

import { Settings } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-sync-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiLabel,
    TuiSwitch,
    PreferencesCardComponent,
  ],
  template: `
    <tw-preferences-card title="Sync" icon="@tui.arrow-left-right">
      <div class="switch-container">
        <label tuiLabel>
          Remote Sync
          <input
            tuiSwitch
            type="checkbox"
            [ngModel]="settings.remoteSync()"
            (ngModelChange)="settings.updateRemoteSync($event)"
          />
        </label>
        <label tuiLabel>
          Encryption
          <input
            tuiSwitch
            type="checkbox"
            [ngModel]="settings.encryption()"
            (ngModelChange)="settings.updateEncryption($event)"
          />
        </label>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncPreferencesComponent {
  settings = inject(Settings);
}
