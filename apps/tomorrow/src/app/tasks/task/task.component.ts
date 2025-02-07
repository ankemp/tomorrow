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
import { ActivatedRoute } from '@angular/router';
import {
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiIcon,
} from '@taiga-ui/core';
import { TuiLink } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiSkeleton } from '@taiga-ui/kit';
import { TuiFiles } from '@taiga-ui/kit';
import { TuiElasticContainer } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiHeader } from '@taiga-ui/layout';
import { file } from 'opfs-tools';

import { Settings, Task, Tasks } from '@tmrw/data-access';

import { FormatDatePipe } from '../_primitives/format-date/format-date.pipe';

@Component({
  selector: 'tw-task',
  imports: [
    CommonModule,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiIcon,
    TuiLink,
    TuiBadge,
    TuiChip,
    TuiSkeleton,
    TuiFiles,
    TuiElasticContainer,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    FormatDatePipe,
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
  settings = inject(Settings);
  task = signal<Task | null>(null);

  taskExists = computed(() => {
    return !!this.task();
  });

  duration = computed(() => {
    const minutes = this.task()?.duration ?? 0;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  });

  hasAttachments = computed(() => {
    return (this.task()?.attachments?.length ?? 0) > 0;
  });

  attachments = computed(() => {
    return this.task()!
      .attachments.map(async (attachment) => {
        const f = await file(
          `files/${this.task()?.id}/${attachment}`,
        ).getOriginFile();
        return f;
      })
      .filter(Boolean);
  });

  hasNotes = computed(() => {
    return !!this.task()?.notes;
  });

  truncateNotes = signal(true);

  shouldTruncateNotes = computed(() => {
    return (this.task()?.notes?.length ?? 0) > 200;
  });

  notes = computed(() => {
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
    private activatedRoute: ActivatedRoute,
  ) {
    if (isPlatformBrowser(platformId)) {
      effect(() => {
        const t = Tasks.getTaskById(this.activatedRoute.snapshot.params['id']);
        if (t) {
          this.task.set(t);
        } else {
          // TODO: Redirect to 404
        }
      });
    }
  }

  async getImageSrc(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  toggleSubtask(task: Task, subtaskIndex: number) {
    Tasks.toggleSubtask(task, subtaskIndex);
  }

  toggleTask(task: Task) {
    Tasks.toggleTask(task);
  }

  deleteTask(task: Task) {
    Tasks.removeOne({ id: task.id });
  }
}
