import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TuiAppearance, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiConnected, TuiSkeleton } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import * as QRCode from 'qrcode';

import { Settings } from '@tmrw/data-access';

@Component({
  selector: 'tw-add-device',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiTitle,
    TuiAvatar,
    TuiConnected,
    TuiSkeleton,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
  ],
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDeviceComponent {
  readonly settings = inject(Settings);
  readonly dataUri = signal<string>('');
  readonly loadingQRCode = signal<boolean>(false);
  readonly loadingQRCodeFailed = signal<boolean>(false);

  constructor() {
    effect(async () => {
      this.loadingQRCode.set(true);
      this.loadingQRCodeFailed.set(false);
      const value = this.settings.qrCodeString();
      if (value) {
        try {
          const dataUri = await QRCode.toDataURL(value, {
            scale: 4,
          });
          this.dataUri.set(dataUri);
          this.loadingQRCode.set(false);
        } catch (error) {
          console.error(error);
          this.loadingQRCodeFailed.set(true);
        }
      }
    });
  }
}
