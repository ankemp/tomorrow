import { isPlatformBrowser } from '@angular/common';
import { Component, effect, Inject, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TUI_DARK_MODE, TuiRoot } from '@taiga-ui/core';

import { Settings, syncManager } from '@tmrw/data-access';

import { AppBarComponent } from './core/app-bar/app-bar.component';

@Component({
  imports: [RouterModule, TuiRoot, AppBarComponent],
  selector: 'tw-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly darkMode = inject(TUI_DARK_MODE);
  readonly settings = inject(Settings);

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (isPlatformBrowser(platformId)) {
      effect(() => {
        if (this.settings.remoteSync()) {
          syncManager.startAll();
        } else {
          syncManager.pauseAll();
        }
      });
    }
  }
}
