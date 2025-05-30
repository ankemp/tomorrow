import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TuiDropdownMobile } from '@taiga-ui/addon-mobile';
import {
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiIcon,
  TuiLink,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiChip,
  TuiElasticContainer,
  TuiFiles,
  TuiPreview,
  TuiPreviewDialogDirective,
  TuiProgress,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { PolymorpheusOutlet } from '@taiga-ui/polymorpheus';
import { differenceInMinutes, roundToNearestMinutes } from 'date-fns';
import { isNil } from 'es-toolkit';

import { Attachments, Settings, Tasks } from '@tmrw/data-access';
import { Task, TaskTimer } from '@tmrw/data-access-models';
import {
  ActionBarPortalComponent,
  FormatDatePipe,
  FormatDurationPipe,
} from '@tmrw/ui/core';

import { EmptyStateComponent } from '../_blocks/empty-state/empty-state.component';
import { TaskTimerComponent } from '../_blocks/timer.component';
import { CategoryChipComponent } from '../_primitives/category-chip.component';
import { PriorityPinComponent } from '../_primitives/priority-pin.component';
import { TaskService } from '../task.service';

@Component({
  selector: 'tw-task',
  imports: [
    CommonModule,
    RouterModule,
    TuiDropdownMobile,
    TuiAppearance,
    TuiButton,
    TuiDropdown,
    TuiDataList,
    TuiIcon,
    TuiLink,
    TuiTitle,
    TuiChip,
    TuiFiles,
    TuiPreview,
    TuiPreviewDialogDirective,
    TuiProgress,
    TuiElasticContainer,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    PolymorpheusOutlet,
    ActionBarPortalComponent,
    CategoryChipComponent,
    EmptyStateComponent,
    FormatDatePipe,
    FormatDurationPipe,
    PriorityPinComponent,
    TaskTimerComponent,
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

  readonly timerChip = signal<'elapsed' | 'remaining'>('elapsed');
  readonly timerDropdownOpen = signal<number>(-1);
  readonly ongoingTimerIndex = computed(() => {
    return this.task()?.timers?.findIndex((t) => !t.end) ?? -1;
  });
  readonly ongoingTimer = computed(() => {
    return this.task()?.timers?.find((t) => !t.end) ?? undefined;
  });
  readonly completedTimers = computed(() => {
    return this.task()?.timers?.filter((t) => !!t.end) ?? [];
  });
  readonly completedTimerCount = computed(() => {
    return this.completedTimers().length;
  });
  readonly totalElapsedTime = computed(() => {
    const completedTimers = this.completedTimers();
    if (!completedTimers) {
      return 0;
    } else {
      return completedTimers.reduce((acc, t) => {
        return acc + this.taskTimerToMinutes(t);
      }, 0);
    }
  });
  readonly totalRemainingTime = computed(() => {
    const totalElapsedTime = this.totalElapsedTime();
    const duration = this.task()?.duration;
    if (isNil(duration)) {
      return null;
    }
    const timeLeft = duration - totalElapsedTime;
    if (timeLeft < 0) {
      return 0;
    }
    return timeLeft;
  });

  readonly hasSubTasks = computed(() => {
    return (this.task()?.subTasks?.length ?? 0) > 0;
  });
  readonly subTasks = computed(() => {
    return this.task()?.subTasks;
  });
  readonly showCompletedSubtasks = signal(true);
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
  readonly previewFileIndex = signal(-1);
  readonly previewFile = computed(() => {
    return this.attachments()[this.previewFileIndex()];
  });
  readonly previewFileBlob = computed(() => {
    const file = this.previewFile();
    if (file && file.type.includes('image')) {
      return URL.createObjectURL(file);
    }
    return null;
  });
  readonly filePreviewOpen = linkedSignal(() => {
    return this.previewFileIndex() !== -1;
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
    let fullNotes = this.task()?.notes || '';

    fullNotes = this.convertTextToClickableLinks(fullNotes);

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

  constructor(activatedRoute: ActivatedRoute) {
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

  navigateToEditWithAccordion(index: number) {
    this.router.navigate(['/tasks', this.task()?.id, 'edit'], {
      queryParams: { openAccordion: index },
    });
  }

  pinTask(task: Task) {
    this.taskService.togglePinTask(task);
    this.menuOpen.set(false);
  }

  toggleTimerDropdown(index: number): void {
    this.timerDropdownOpen.update((state) => {
      return state === index ? -1 : index;
    });
  }

  toggleTimerChip() {
    this.timerChip.update((state) => {
      if (isNil(this.task()?.duration)) {
        return 'elapsed';
      }
      return state === 'elapsed' ? 'remaining' : 'elapsed';
    });
  }

  convertTextToClickableLinks(text: string) {
    // Regular expressions for links and phone numbers
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const phoneRegex =
      /(\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})/g;

    // Replace URLs with clickable <a> tags
    let linkedText = text.replace(urlRegex, (url) => {
      let href = url;
      if (!href.startsWith('http')) {
        href = `http://${href}`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Replace phone numbers with clickable tel: links
    linkedText = linkedText.replace(phoneRegex, (phoneNumber) => {
      const cleanNumber = phoneNumber.replace(/[^+\d]/g, ''); // Remove all non-numeric characters except +
      return `<a href="tel:${cleanNumber}">${phoneNumber}</a>`;
    });

    return linkedText;
  }

  taskTimerToMinutes(timer: TaskTimer): number {
    if (timer.start && timer.end) {
      return Math.abs(
        differenceInMinutes(
          roundToNearestMinutes(timer.start),
          roundToNearestMinutes(timer.end),
        ),
      );
    }
    return 0;
  }

  downloadAttachment(file: File) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
