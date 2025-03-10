import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDialogService,
  TuiIcon,
  TuiLabel,
  TuiLink,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiAvatar,
  TuiProgress,
  TuiProgressLabel,
} from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { NgMathPipesModule } from 'ngx-pipes';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Attachments, Settings } from '@tmrw/data-access';

import { version } from '../../../environments/version';
import { Context } from '../../core/context.store';
import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-device-preferences',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiButton,
    TuiIcon,
    TuiLabel,
    TuiLink,
    TuiAvatar,
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
      <div class="version-cell" tuiCell>
        <tui-avatar src="@tui.rocket" />
        <div tuiTitle>
          <div class="version-container">
            App Version:&nbsp;
            <a tuiLink [href]="versionUrl" target="_blank">
              {{ version.substring(0, 7) }}
            </a>
          </div>
          @if (context.isUpdating()) {
            <label class="update-progress" tuiProgressLabel>
              Updating...
              <progress tuiProgressBar size="l" [max]="100"></progress>
            </label>
          } @else {
            <label tuiLabel>
              <tui-icon
                style="--t-bg: unset"
                tuiAppearance="positive"
                icon="@tui.check"
              />
              Up to date
            </label>
          }
        </div>
      </div>
      <button
        appearance="secondary-destructive"
        size="s"
        tuiButton
        (click)="clearStorage()"
      >
        Clear device data
      </button>
      <button
        appearance="secondary-destructive"
        size="s"
        tuiButton
        (click)="resetUser()"
      >
        Reset user scope
      </button>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  styles: `
    .version-cell {
      tui-avatar {
        color: var(--tui-background-accent-1);
        margin: 0.55rem;
      }

      [tuititle] {
        width: 100%;
      }

      .version-container {
        display: flex;
        flex-direction: row;
      }

      .update-progress {
        color: var(--tui-text-primary-on-accent-1);
        inline-size: 100%;
        text-shadow: 0 0 0.25rem #000;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicePreferencesComponent {
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  readonly attachmentsStore = inject(Attachments);
  readonly settingsStore = inject(Settings);
  readonly context = inject(Context);
  readonly version: string = version;
  get versionUrl() {
    if (this.version === 'DEV') {
      return 'https://github.com/ankemp/tomorrow';
    }
    return `https://github.com/ankemp/tomorrow/commit/${this.version}`;
  }

  clearStorage() {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirm Data Deletion',
        data: {
          appearance: 'destructive',
          content: 'Delete all device data permanently?',
          yes: 'Delete',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          this.attachmentsStore.clearStorage();
        }),
        switchMap(() => {
          return this.alerts.open('Data deleted', {
            appearance: 'destructive',
            icon: '@tui.trash-2',
          });
        }),
      )
      .subscribe();
  }

  resetUser() {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Reset User Scope',
        data: {
          appearance: 'destructive',
          content: `Reset user scope, and leave sync group?<br />This will not delete any task data.`,
          yes: 'Reset',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          this.settingsStore.resetUser();
        }),
        switchMap(() => {
          return this.alerts.open('User scope reset', {
            appearance: 'destructive',
            icon: '@tui.rotate-ccw',
          });
        }),
      )
      .subscribe();
  }
}
