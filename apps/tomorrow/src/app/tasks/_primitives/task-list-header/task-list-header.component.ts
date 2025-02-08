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
  icon = input<string>();
  title = input.required<string>();
  subtitle = input<string>();
  headerSize = input<TuiHeader['size']>('m');

  hasIcon = computed(() => !!this.icon());
  hasSubtitle = computed(() => !!this.subtitle());
}
