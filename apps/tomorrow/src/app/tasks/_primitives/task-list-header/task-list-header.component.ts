import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'tw-task-list-header',
  imports: [CommonModule, TuiHeader, TuiIcon, TuiTitle],
  templateUrl: './task-list-header.component.html',
  styleUrl: './task-list-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListHeaderComponent {
  readonly icon = input<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly headerSize = input<TuiHeader['size']>('m');

  readonly hasIcon = computed(() => !!this.icon());
  readonly hasSubtitle = computed(() => !!this.subtitle());
}
