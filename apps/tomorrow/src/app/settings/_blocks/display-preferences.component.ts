import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TUI_DARK_MODE, TuiButton } from '@taiga-ui/core';

import { PreferencesCardComponent } from '../_primitives/preferences-card.component';

@Component({
  selector: 'tw-display-preferences',
  imports: [CommonModule, FormsModule, TuiButton, PreferencesCardComponent],
  template: `
    <tw-preferences-card title="Display" icon="@tui.palette">
      <div class="switch-container">
        <div tuiLabel>
          Theme (Dark/Light)

          <button
            appearance="action"
            size="xs"
            [iconStart]="themeIcon()"
            tuiButton
            (click)="darkMode.set(!darkMode())"
          >
            {{ darkMode() ? 'Go Light' : 'Go Dark' }}
          </button>
        </div>
      </div>
    </tw-preferences-card>
  `,
  styleUrl: './styles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayPreferencesComponent {
  readonly darkMode = inject(TUI_DARK_MODE);

  themeIcon = computed(() => {
    return this.darkMode() ? '@tui.sun' : '@tui.moon';
  });
}
