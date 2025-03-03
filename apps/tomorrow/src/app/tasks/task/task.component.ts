import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TuiDropdownMobile } from '@taiga-ui/addon-mobile';
import {
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiGroup,
  TuiIcon,
  TuiLink,
} from '@taiga-ui/core';
import {
  TuiBadge,
  TuiChip,
  TuiElasticContainer,
  TuiFiles,
  TuiProgress,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';

import { Attachments, Settings, Task, Tasks } from '@tmrw/data-access';

import { ActionBarComponent } from '../../core/action-bar/action-bar-portal.component';
import { EmptyStateComponent } from '../_primitives/empty-state/empty-state.component';
import { FormatDatePipe } from '../_primitives/format-date.pipe';
import { FormatDurationPipe } from '../_primitives/format-duration.pipe';
import { PriorityPinComponent } from '../_primitives/priority-pin.component';
import { TaskService } from '../task.service';

@Component({
  selector: 'tw-task',
  imports: [
    CommonModule,
    RouterModule,
    TuiDropdownMobile,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiDropdown,
    TuiGroup,
    TuiDataList,
    TuiIcon,
    TuiLink,
    TuiBadge,
    TuiChip,
    TuiFiles,
    TuiProgress,
    TuiElasticContainer,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    ActionBarComponent,
    EmptyStateComponent,
    FormatDatePipe,
    FormatDurationPipe,
    PriorityPinComponent,
  ],
  providers: [Attachments, TaskService],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  private readonly router = inject(Router);
  readonly settings = inject(Settings);
  readonly attachmentsStore = inject(Attachments);
  readonly taskService = inject(TaskService);

  readonly menuOpen = signal(false);
  readonly task = signal<Task | null>(null);

  readonly taskExists = computed(() => {
    return !!this.task();
  });

  readonly hasSubTasks = computed(() => {
    return (this.task()?.subTasks?.length ?? 0) > 0;
  });

  readonly subTaskCount = computed(() => {
    if (this.hasSubTasks()) {
      return this.task()!.subTasks!.length;
    }
    return 0;
  });

  readonly subTaskCompletedCount = computed(() => {
    if (this.hasSubTasks()) {
      return this.task()!.subTasks!.filter((t) => !!t.completedAt).length;
    }
    return 0;
  });

  readonly subTasksPercentComplete = computed(() => {
    if (this.hasSubTasks()) {
      const total = this.task()!.subTasks!.length;
      const completed = this.task()!.subTasks!.filter(
        (t) => !!t.completedAt,
      ).length;
      return (completed / total) * 100;
    }
    return 0;
  });

  readonly hasAttachments = this.attachmentsStore.hasAttachments;

  readonly attachments = this.attachmentsStore.files;

  readonly attachmentCount = computed(() => {
    if (this.hasAttachments()) {
      return this.attachments().length;
    }
    return 0;
  });

  readonly hasNotes = computed(() => {
    return !!this.task()?.notes;
  });

  readonly truncateNotes = signal(true);
  private readonly truncateThreshold = 200;

  readonly shouldTruncateNotes = computed(() => {
    return (this.task()?.notes?.length ?? 0) > this.truncateThreshold;
  });

  readonly notes = computed(() => {
    const fullNotes = this.task()?.notes || '';

    if (
      !this.shouldTruncateNotes() ||
      !this.truncateNotes() ||
      fullNotes === ''
    ) {
      return fullNotes;
    }
    const threshold = this.truncateThreshold;
    const rest = fullNotes.slice(threshold);
    const match = rest.match(/[.!?]/);
    if (match !== null) {
      const end = threshold + match.index! + 1;
      return fullNotes.slice(0, end);
    }
    return fullNotes.slice(0, threshold) + '...';
  });

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    activatedRoute: ActivatedRoute,
  ) {
    if (isPlatformBrowser(platformId)) {
      effect((onCleanup) => {
        const t = Tasks.getTaskById(activatedRoute.snapshot.params['id']);
        if (t) {
          this.task.set(t);
          this.attachmentsStore.init(t);
        } else {
          this.router.navigate(['/tasks/404']);
        }
        onCleanup(() => {
          this.attachmentsStore.dispose();
        });
      });
    }
  }

  navigateToEditWithAccordion(index: number) {
    this.router.navigate(['/tasks', this.task()?.id, 'edit'], {
      queryParams: { openAccordion: index },
    });
  }

  pinTask(task: Task) {
    this.taskService.pinTask(task);
    this.menuOpen.set(false);
  }
}
