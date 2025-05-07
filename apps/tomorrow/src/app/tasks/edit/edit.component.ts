import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
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
import { isNotNil } from 'es-toolkit';

import { Attachments, Settings, Tasks } from '@tmrw/data-access';
import { SubTask, Task } from '@tmrw/data-access-models';

import { CategorySelectorComponent } from '../_formcontrols/category-selector/category-selector.component';
import { DatePickerComponent } from '../_formcontrols/date-picker/date-picker.component';
import { DurationComponent } from '../_formcontrols/duration/duration.component';
import { FileUploadComponent } from '../_formcontrols/file-upload/file-upload.component';
import { PrioritySelectorComponent } from '../_formcontrols/priority-selector/priority-selector.component';
import { ReminderToggleComponent } from '../_formcontrols/reminder-toggle/reminder-toggle.component';
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
    PrioritySelectorComponent,
    ReminderToggleComponent,
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
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly alerts = inject(TuiAlertService);
  readonly settings = inject(Settings);
  readonly attachmentsStore = inject(Attachments);
  readonly form = this.fb.group({
    userId: this.fb.control<string | null>(null),
    title: this.fb.control<string>('', [Validators.required]),
    date: this.fb.control<Date>(null as any, [Validators.required]),
    reminder: this.fb.control<boolean>(
      this.settings.defaultReminderState() !== 'never',
    ),
    category: this.fb.control<string>(null as any, [Validators.required]),
    priority: this.fb.control<number | null>(null),
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

  constructor() {
    effect(() => {
      const t = Tasks.getTaskById(this.activatedRoute.snapshot.params['id']);
      if (t) {
        this.task.set(t);
        this.attachmentsStore.init(t);
        this.setFormData(t);
      } else {
        this.router.navigate(['/tasks/404']);
      }
    });
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
      ...task,
      attachments: this.attachmentsStore.files(),
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
            ...task,
            subTasks: subTasks?.filter((st) => st.title?.length),
            attachments: attachments?.map((file) => file.name),
          },
        },
      );

      this.alerts
        .open('Task updated', { appearance: 'success', icon: '@tui.check' })
        .subscribe();
      const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
      if (isNotNil(returnUrl)) {
        this.router.navigate([returnUrl], { replaceUrl: true });
      } else {
        this.router.navigate(['/tasks', taskId], { replaceUrl: true });
      }
    }
  }
}
