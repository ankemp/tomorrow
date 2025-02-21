import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  inject,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiLabel,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiAccordion, TuiAccordionComponent } from '@taiga-ui/experimental';
import { TuiBadgeNotification } from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { TuiTextareaModule } from '@taiga-ui/legacy';

import { Attachments, Settings, SubTask, Task, Tasks } from '@tmrw/data-access';

import { CategorySelectorComponent } from '../_formcontrols/category-selector/category-selector.component';
import { DatePickerComponent } from '../_formcontrols/date-picker/date-picker.component';
import { DurationComponent } from '../_formcontrols/duration/duration.component';
import { FileUploadComponent } from '../_formcontrols/file-upload/file-upload.component';
import { SubtasksComponent } from '../_formcontrols/subtasks/subtasks.component';

@Component({
  selector: 'tw-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiAutoFocus,
    TuiAppearance,
    TuiButton,
    TuiLabel,
    TuiTextfield,
    TuiTitle,
    TuiAccordion,
    TuiBadgeNotification,
    TuiCardLarge,
    TuiForm,
    TuiHeader,
    TuiTextareaModule,
    CategorySelectorComponent,
    DatePickerComponent,
    DurationComponent,
    FileUploadComponent,
    SubtasksComponent,
  ],
  providers: [Attachments],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent implements AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly alerts = inject(TuiAlertService);
  readonly settings = inject(Settings);
  readonly attachmentsStore = inject(Attachments);
  readonly form = this.fb.group({
    userId: this.fb.control<string | null>(null),
    title: this.fb.control<string>('', [Validators.required]),
    date: this.fb.control<Date>(null as any, [Validators.required]),
    category: this.fb.control<string>(null as any, [Validators.required]),
    description: this.fb.control<string | null>(null),
    location: this.fb.control<string | null>(null),
    duration: this.fb.control<number | null>(null),
    subTasks: this.fb.control<SubTask[]>([]),
    attachments: this.fb.control<File[]>([]),
    notes: this.fb.control<string | null>(null),
  });

  readonly task = signal<Task | null>(null);

  @ViewChild(TuiAccordionComponent, { static: true })
  readonly accordion!: TuiAccordionComponent;

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    if (isPlatformBrowser(platformId)) {
      effect(() => {
        const t = Tasks.getTaskById(activatedRoute.snapshot.params['id']);
        if (t) {
          this.task.set(t);
          this.attachmentsStore.init(t);
          this.setFormData(t);
        } else {
          this.router.navigate(['/tasks/404']);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    const openAccordion: number =
      this.activatedRoute.snapshot.queryParams['openAccordion'];
    if (openAccordion) {
      this.openAccordionAt(openAccordion);
    }
  }

  async setFormData(task: Task) {
    const formData = {
      userId: task.userId,
      title: task.title,
      date: task.date,
      category: task.category,
      description: task.description,
      location: task.location,
      duration: task.duration,
      subTasks: task.subTasks,
      attachments: this.attachmentsStore.files(),
      notes: task.notes,
    };
    this.form.patchValue(formData);
  }

  openAccordionAt(index: number) {
    const accordion = this.accordion.directives.get(index);
    if (accordion) {
      const expand = this.accordion.expands.get(index);
      if (expand) {
        expand.expanded = true;
      }
      accordion.open.set(true);
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.form.valid) {
      const taskId = this.task()?.id;
      const { attachments, subTasks, ...task } = this.form.value;

      if (
        this.form.get('attachments')?.dirty &&
        attachments &&
        attachments.length > 0
      ) {
        await this.attachmentsStore.updateAttachments(attachments);
      } else if (
        this.form.get('attachments')?.dirty &&
        (!attachments || attachments.length === 0)
      ) {
        await this.attachmentsStore.clearAttachments();
      }

      Tasks.updateOne(
        { id: taskId },
        {
          $set: {
            title: task.title,
            date: task.date,
            category: task.category,
            description: task.description,
            location: task.location,
            duration: task.duration,
            notes: task.notes,
            subTasks: subTasks?.filter((st) => st.title?.length),
            attachments: attachments?.map((file) => file.name),
          },
        },
      );

      this.alerts
        .open('Task updated', { appearance: 'success', icon: '@tui.check' })
        .subscribe();
      this.router.navigate(['/tasks', taskId]);
    }
  }
}
