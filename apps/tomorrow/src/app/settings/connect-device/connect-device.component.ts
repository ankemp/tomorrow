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
  TuiAppearance,
  TuiButton,
  TuiIcon,
  TuiNotification,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiAvatar, TuiConnected, TuiSkeleton } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import {
  LOAD_WASM,
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
  ScannerQRCodeDevice,
  ScannerQRCodeSymbolType,
} from 'ngx-scanner-qrcode';
import { debounceTime, distinctUntilKeyChanged, filter, map } from 'rxjs';

import { QRCodeData, Settings } from '@tmrw/data-access';

LOAD_WASM().subscribe();

@Component({
  selector: 'tw-connect-device',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiButton,
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

  importUser(data: QRCodeData) {
    this.settings.importUser(data);
    this.router.navigate(['/settings']);
  }
}
