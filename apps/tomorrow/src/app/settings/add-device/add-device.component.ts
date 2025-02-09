import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tw-add-device',
  imports: [CommonModule],
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDeviceComponent {}
