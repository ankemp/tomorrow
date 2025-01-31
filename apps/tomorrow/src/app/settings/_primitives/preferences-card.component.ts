import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiAppearance, TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

@Component({
  selector: 'tw-preferences-card',
  imports: [CommonModule, TuiAppearance, TuiIcon, TuiCardLarge, TuiCell],
  template: `
    <div tuiCardLarge tuiAppearance="floating">
      <div tuiCell>
        <tui-icon [icon]="icon()" />
        <h2 tuiTitle>{{ title() }} Preferences</h2>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesCardComponent {
  title = input.required<string>();
  icon = input.required<string>();
}
