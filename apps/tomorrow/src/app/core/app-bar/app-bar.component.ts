import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiPlatform } from '@taiga-ui/cdk';
import { TuiButton, TuiTitle } from '@taiga-ui/core';
import { TuiAppBar } from '@taiga-ui/layout';

import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';

@Component({
  selector: 'tw-app-bar',
  imports: [
    CommonModule,
    TuiButton,
    TuiTitle,
    TuiAppBar,
    TuiPlatform,
    ThemeTogglerComponent,
  ],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBarComponent {}
