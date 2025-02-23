import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiElasticSticky } from '@taiga-ui/addon-mobile';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'tw-task-list-header',
  imports: [CommonModule, TuiElasticSticky, TuiHeader, TuiIcon, TuiTitle],
  templateUrl: './task-list-header.component.html',
  styleUrl: './task-list-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sticky]': 'sticky()',
    '[attr.tuiElasticSticky]': 'sticky() ? "" : null',
  },
})
export class TaskListHeaderComponent {
  readonly icon = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly headerSize = input<TuiHeader['size']>('m');

  readonly sticky = input<boolean>();

  readonly hasIcon = computed(() => !!this.icon());
  readonly hasSubtitle = computed(() => !!this.subtitle());
}
