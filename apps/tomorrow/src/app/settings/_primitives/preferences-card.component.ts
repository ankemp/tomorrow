import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiAppearance, TuiIcon } from '@taiga-ui/core';
import { TuiCardLarge, TuiCell } from '@taiga-ui/layout';

@Component({
  selector: 'tw-preferences-card',
  imports: [CommonModule, TuiAppearance, TuiIcon, TuiCardLarge, TuiCell],
  template: `
    <div tuiCardLarge="compact" tuiAppearance="floating">
      <div tuiCell>
        <tui-icon [icon]="icon()" />
        <h2 tuiTitle>{{ title() }} Preferences</h2>
      </div>
      <div class="preferences-container">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .preferences-container {
      display: grid;
      gap: 1rem;

      &::ng-deep [tuiLabel] {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesCardComponent {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
}
