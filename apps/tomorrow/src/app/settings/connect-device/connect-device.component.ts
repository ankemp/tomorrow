import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  linkedSignal,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDialogService,
  TuiGroup,
  TuiIcon,
  TuiNotification,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiAvatar,
  TuiConnected,
  TuiSkeleton,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import {
  LOAD_WASM,
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
  ScannerQRCodeDevice,
  ScannerQRCodeSymbolType,
} from 'ngx-scanner-qrcode';
import {
  debounceTime,
  distinctUntilKeyChanged,
  EMPTY,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { QRCodeData, Settings, Tasks } from '@tmrw/data-access';

LOAD_WASM().subscribe();

@Component({
  selector: 'tw-connect-device',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiButton,
    TuiGroup,
    TuiIcon,
    TuiNotification,
    TuiTitle,
    TuiAvatar,
    TuiConnected,
    TuiSkeleton,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    NgxScannerQrcodeModule,
  ],
  templateUrl: './connect-device.component.html',
  styleUrl: './connect-device.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectDeviceComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  readonly settings = inject(Settings);
  readonly isStarted = signal(false);
  readonly isLoading = signal(true);

  readonly devices = signal<ScannerQRCodeDevice[]>([]);
  readonly deviceCount = computed(() => this.devices().length);
  readonly activeDevice = linkedSignal(() => {
    const backDevice = this.backDevice();
    if (backDevice) {
      return backDevice;
    }
    return this.devices()[0];
  });
  readonly backDevice = computed(() =>
    this.devices().find((device) => device.label.includes('back')),
  );

  readonly data = signal<string>('');
  readonly parsedData = computed(() => {
    const stringData = this.data();
    if (!stringData) {
      return null;
    }
    try {
      return JSON.parse(this.data()) as QRCodeData;
    } catch (e) {
      console.error(e);
      return null;
    }
  });
  readonly foundData = computed<boolean>(() => !!this.parsedData());

  @ViewChild(NgxScannerQrcodeComponent) scanner!: NgxScannerQrcodeComponent;

  constructor(private readonly destroyRef: DestroyRef) {
    effect(() => {
      const activeDevice = this.activeDevice();
      if (activeDevice) {
        this.scanner.playDevice(activeDevice.deviceId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scanner.start();
    this.isLoading.set(true);
    this.scanner.devices
      .pipe(
        filter((devices) => devices.length > 0),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((devices) => {
        this.devices.set(devices);
        this.isLoading.set(false);
      });

    this.scanner.data
      .pipe(
        filter((data) => data.length > 0),
        debounceTime(500),
        map((res) =>
          res.find(
            (scan) =>
              scan.type === ScannerQRCodeSymbolType.ScannerQRCode_QRCODE,
          ),
        ),
        filter((scan) => scan !== undefined),
        filter((scan) => scan.value.includes('"use":"tomorrow"')),
        distinctUntilKeyChanged('value'),
      )
      .subscribe((scannedData) => {
        this.data.set(scannedData.value);
        this.scanner.pause();
      });
  }

  toggleCamera() {
    const currentIndex = this.devices().indexOf(this.activeDevice());
    const nextIndex = (currentIndex + 1) % this.devices().length;
    this.activeDevice.set(this.devices()[nextIndex]);
  }

  resetData() {
    this.data.set('');
    this.scanner.play();
  }

  importUser(data: QRCodeData) {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirm Device Sync',
        data: {
          content: 'Syncing will replace all tasks on this device. Proceed?',
          yes: 'Confirm Sync',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => (response ? of(true) : EMPTY)),
        tap(() => {
          this.settings.importUser(data);
          Tasks.removeMany({ date: { $ne: null } });
          // TODO: Remove all files.
          this.router.navigate(['/settings']);
        }),
        switchMap(() => {
          return this.alerts.open('Device synced successfully', {
            appearance: 'success',
            icon: '@tui.check-circle',
          });
        }),
      )
      .subscribe();
  }
}
