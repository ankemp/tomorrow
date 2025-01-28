import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TUI_DARK_MODE, TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'tw-theme-toggler',
  imports: [CommonModule, TuiButton],
  templateUrl: './theme-toggler.component.html',
  styleUrl: './theme-toggler.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeTogglerComponent {
  readonly darkMode = inject(TUI_DARK_MODE);

  icon = computed(() => {
    return this.darkMode() ? '@tui.sun' : '@tui.moon';
  });
}
