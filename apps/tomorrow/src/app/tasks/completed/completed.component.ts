import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tw-completed',
  imports: [CommonModule],
  templateUrl: './completed.component.html',
  styleUrl: './completed.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletedComponent {}
