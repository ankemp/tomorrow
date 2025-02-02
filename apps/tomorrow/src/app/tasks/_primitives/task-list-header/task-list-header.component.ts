import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'tw-task-list-header',
  imports: [CommonModule, TuiHeader, TuiTitle],
  templateUrl: './task-list-header.component.html',
  styleUrl: './task-list-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  headerSize = input<TuiHeader['size']>('m');

  hasSubtitle = computed(() => !!this.subtitle());
}
