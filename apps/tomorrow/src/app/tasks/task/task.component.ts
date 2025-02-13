import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  inject,
  model,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TuiDropdownMobile } from '@taiga-ui/addon-mobile';
import {
  TuiAlertService,
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiDataList,
  TuiDialogService,
  TuiDropdown,
  TuiIcon,
  TuiLink,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiBadge,
  TuiChip,
  TuiElasticContainer,
  TuiFiles,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { EMPTY, map, of, switchMap, tap } from 'rxjs';

import { Attachments, Settings, Task, Tasks } from '@tmrw/data-access';

import { EmptyStateComponent } from '../_primitives/empty-state/empty-state.component';
import { FormatDatePipe } from '../_primitives/format-date/format-date.pipe';

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
    TuiDataList,
    TuiIcon,
    TuiLink,
    TuiBadge,
    TuiChip,
    TuiFiles,
    TuiElasticContainer,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    EmptyStateComponent,
    FormatDatePipe,
  ],
  providers: [Attachments],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  readonly settings = inject(Settings);
  readonly attachmentsStore = inject(Attachments);

  readonly menuOpen = model(false);
  readonly task = signal<Task | null>(null);

  readonly taskExists = computed(() => {
    return !!this.task();
  });

  readonly duration = computed(() => {
    const minutes = this.task()?.duration ?? 0;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  });

  readonly hasSubTasks = computed(() => {
    return (this.task()?.subTasks?.length ?? 0) > 0;
  });

  readonly hasAttachments = this.attachmentsStore.hasAttachments;

  readonly attachments = this.attachmentsStore.files;

  readonly hasNotes = computed(() => {
    return !!this.task()?.notes;
  });

  readonly truncateNotes = signal(true);

  readonly shouldTruncateNotes = computed(() => {
    return (this.task()?.notes?.length ?? 0) > 200;
  });

  readonly notes = computed(() => {
    const fullNotes = this.task()?.notes || '';

    if (!this.truncateNotes() || fullNotes === '') {
      return fullNotes;
    }
    const threshold = 200;
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
          // TODO: Redirect to 404
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

  toggleSubtask(task: Task, subtaskIndex: number) {
    Tasks.toggleSubtask(task, subtaskIndex);
  }

  toggleTask(task: Task) {
    const isCompleted = !!task.completedAt;
    Tasks.toggleTask(task);
    this.alerts
      .open(isCompleted ? 'Task marked incomplete' : 'Task completed', {
        appearance: isCompleted ? 'destructive' : 'success',
        icon: isCompleted ? '@tui.circle-slash' : '@tui.circle-check',
      })
      .subscribe();
  }

  deleteTask(task: Task) {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirm Deletion',
        data: {
          appearance: 'destructive',
          content: 'Delete this task permanently?',
          yes: 'Delete',
          no: 'Cancel',
        },
      })
      .pipe(
        switchMap((response) => {
          return response ? of(true) : EMPTY;
        }),
        tap(() => {
          this.attachmentsStore.clearAttachments();
          Tasks.removeOne({ id: task.id });
          this.router.navigate(['/tasks']);
        }),
        switchMap(() => {
          return this.alerts.open('Task deleted', {
            appearance: 'destructive',
            icon: '@tui.trash-2',
          });
        }),
      )
      .subscribe();
  }
}
