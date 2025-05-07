import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EmbeddedViewRef,
  inject,
  OnDestroy,
  TemplateRef,
} from '@angular/core';

import { ActionBarPortalService } from './action-bar.service';

@Component({
  selector: 'tw-action-bar-portal',
  template: `<ng-content></ng-content>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionBarPortalComponent implements AfterViewInit, OnDestroy {
  private readonly actionBarPortal = inject(ActionBarPortalService);
  @ContentChild('actionBar') actionBar!: TemplateRef<unknown>;

  ref!: EmbeddedViewRef<unknown>;

  ngAfterViewInit(): void {
    if (this.actionBar) {
      this.ref = this.actionBarPortal.addTemplate(this.actionBar);
    }
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.destroy();
    }
  }
}
