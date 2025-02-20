import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  TuiAlertService,
  TuiButton,
  TuiDialogService,
  TuiIcon,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiProgress, TuiProgressLabel } from '@taiga-ui/kit';
import { TuiCell } from '@taiga-ui/layout';
import { NgMathPipesModule } from 'ngx-pipes';
import { EMPTY, of, switchMap, tap } from 'rxjs';

import { Attachments, Settings } from '@tmrw/data-access';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-device-preferences',
  imports: [
    CommonModule,
    TuiButton,
    TuiIcon,
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
        Reset User Scope
      </button>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicePreferencesComponent {
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  readonly attachmentsStore = inject(Attachments);
  readonly settingsStore = inject(Settings);

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
          content: 'Reset user scope, and leave sync group?',
          yes: 'Reset',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          // this.attachmentsStore.clearStorage();
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
