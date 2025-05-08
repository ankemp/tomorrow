import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiLabel } from '@taiga-ui/core';
import { TuiSwitch, TuiTooltip } from '@taiga-ui/kit';

import { Settings } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-sync-preferences',
  imports: [
    CommonModule,
    FormsModule,
    TuiIcon,
    TuiLabel,
    TuiSwitch,
    TuiTooltip,
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
        <!-- TODO: Add ability to delete key, warn about losing all data -->
        <!-- <label tuiLabel>
          <span>
            Encryption
            <tui-icon
              style="--t-bg: unset"
              [appearance]="
                settings.hasEncryptionKey() ? 'positive' : 'negative'
              "
              [icon]="encryptionIcon()"
              tuiTooltip="Encryption key is {{
                settings.hasEncryptionKey() ? 'ready' : 'not ready'
              }}"
            />
          </span>
          <input
            tuiSwitch
            type="checkbox"
            [ngModel]="settings.encryption()"
            (ngModelChange)="settings.updateEncryption($event)"
            [disabled]="!this.settings.remoteSync()"
          />
        </label> -->
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncPreferencesComponent {
  readonly settings = inject(Settings);

  readonly encryptionIcon = computed(() => {
    return this.settings.hasEncryptionKey()
      ? '@tui.shield-check'
      : '@tui.shield-x';
  });
}
