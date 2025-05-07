import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiElasticSticky } from '@taiga-ui/addon-mobile';
import { TUI_DARK_MODE, TuiRoot, TuiScrollbar } from '@taiga-ui/core';

import { Settings, syncManager } from '@tmrw/data-access';
import {
  ActionBarComponent,
  AppBarComponent,
  Context,
  SearchComponent,
} from '@tmrw/ui/core';

@Component({
  imports: [
    RouterModule,
    TuiElasticSticky,
    TuiRoot,
    TuiScrollbar,
    ActionBarComponent,
    AppBarComponent,
    SearchComponent,
  ],
  selector: 'tw-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly darkMode = inject(TUI_DARK_MODE);
  readonly settings = inject(Settings);
  readonly context = inject(Context);

  constructor() {
    effect(() => {
      if (this.settings.remoteSync()) {
        syncManager.startAll();
      } else {
        syncManager.pauseAll();
      }
    });
  }

  // TODO: Animate the app bar when scrolling, reduce height of logo, potentially replace with only circle icon(?)
}
