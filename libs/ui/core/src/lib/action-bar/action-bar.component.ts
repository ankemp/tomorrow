import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tuiAsPortal, TuiPortals } from '@taiga-ui/cdk';

import { ActionBarPortalService } from './action-bar.service';

@Component({
  selector: 'lib-action-bar',
  template: `<ng-container #viewContainer />`,
  styles: `
    :host {
      display: block;
      padding: 1rem;

      &:empty {
        display: none;
      }
    }
  `,
  providers: [tuiAsPortal(ActionBarPortalService)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBarComponent extends TuiPortals {}
