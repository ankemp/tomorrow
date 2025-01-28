import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TUI_DARK_MODE, TuiRoot } from '@taiga-ui/core';

import { AppBarComponent } from './core/app-bar/app-bar.component';

@Component({
  imports: [RouterModule, TuiRoot, AppBarComponent],
  selector: 'tw-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly darkMode = inject(TUI_DARK_MODE);
}
