import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

@Component({
  selector: 'tw-not-found',
  imports: [
    CommonModule,
    RouterModule,
    TuiAppearance,
    TuiButton,
    TuiBlockStatus,
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
