import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiElasticSticky } from '@taiga-ui/addon-mobile';
import { tuiClamp } from '@taiga-ui/cdk';
import { TUI_DARK_MODE, TuiRoot, TuiScrollbar } from '@taiga-ui/core';
import { distinctUntilChanged, map, Observable, startWith } from 'rxjs';

import { Settings, syncManager } from '@tmrw/data-access';

import { ActionBarComponent } from './core/action-bar/action-bar.component';
import { AppBarComponent } from './core/app-bar/app-bar.component';
import { SearchComponent } from './core/search/search.component';

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

  // TODO: Animate the app bar when scrolling, reduce height of logo, potentially replace with only circle icon(?)
}
