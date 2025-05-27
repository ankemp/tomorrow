import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { TuiTextareaModule } from '@taiga-ui/legacy';

import { Attachments, Notifications, Settings, Tasks } from '@tmrw/data-access';
import { SubTask } from '@tmrw/data-access-models';
import { Context } from '@tmrw/ui/core';

import { CategorySelectorComponent } from '../_formcontrols/category-selector/category-selector.component';
import { DatePickerComponent } from '../_formcontrols/date-picker/date-picker.component';
import { DurationComponent } from '../_formcontrols/duration/duration.component';
import { FileUploadComponent } from '../_formcontrols/file-upload/file-upload.component';
import { PrioritySelectorComponent } from '../_formcontrols/priority-selector/priority-selector.component';
import { ReminderToggleComponent } from '../_formcontrols/reminder-toggle/reminder-toggle.component';
import { SubtasksComponent } from '../_formcontrols/subtasks/subtasks.component';

@Component({
  selector: 'tw-create',
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
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly alerts = inject(TuiAlertService);
  readonly settings = inject(Settings);
  readonly notifications = inject(Notifications);
  readonly context = inject(Context);
  readonly attachmentsStore = inject(Attachments);
  readonly form = this.fb.group({
    userId: this.fb.control<string>(''),
    title: this.fb.control<string>('', [Validators.required]),
    date: this.fb.control<Date | null>(null, [Validators.required]),
    reminder: this.fb.control<boolean>(
      this.settings.defaultReminderState() !== 'never',
    ),
    category: this.fb.control<string | null>(null, [Validators.required]),
    priority: this.fb.control<number>(0),
    pinned: this.fb.control<boolean>(false),
    description: this.fb.control<string>(''),
    location: this.fb.control<string>(''),
    duration: this.fb.control<number>(0),
    subTasks: this.fb.control<SubTask[]>([]),
    attachments: this.fb.control<File[]>([]),
    notes: this.fb.control<string | null>(null),
  });

  @ViewChild(TuiAccordionComponent, { static: true })
  readonly accordion!: TuiAccordionComponent;

  constructor(private route: ActivatedRoute) {
    effect((onCleanup) => {
      const userId = this.settings.userId();
      this.form.get('userId')?.setValue(userId, { emitEvent: false });
      onCleanup(() => {
        this.attachmentsStore.dispose();
      });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const title = params['title'];
      const desc = params['description'];
      const link = params['link'];
      const description = `${desc}${desc ? '\n' : ''}${link}`;

      if (title) {
        this.form.get('title')?.setValue(title);
      }

      if (desc || link) {
        this.form.get('description')?.setValue(description);
      }
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.form.valid) {
      const { attachments, subTasks, ...formData } = this.form.value;

      const id = Tasks.insert({
        ...formData,
        subTasks: subTasks?.filter((st) => st.title.length),
      });
      if (attachments && attachments.length > 0) {
        this.attachmentsStore.init({ id });
        await this.attachmentsStore.setAttachments(attachments);
        Tasks.updateOne(
          { id },
          { $set: { attachments: attachments.map((file) => file.name) } },
        );
      }

      this.reset();
      this.alerts
        .open('Task created', { appearance: 'success', icon: '@tui.check' })
        .subscribe();
      if (this.settings.onCreateRedirectTo() === 'dashboard') {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      } else {
        this.router.navigate(['/tasks', id], { replaceUrl: true });
      }
    } else {
      // TODO: Handle invalid form, show invalid fields
      this.alerts
        .open('Invalid form', { appearance: 'primary-destructive' })
        .subscribe();
    }
  }

  reset() {
    this.form.reset({
      title: '',
      date: null,
      category: '',
      location: '',
      duration: 0,
      subTasks: [],
      attachments: [],
      notes: '',
    });
    this.accordion.directives.forEach((directive, index) => {
      const expand = this.accordion.expands.get(index);
      if (expand) {
        expand.expanded = false;
      }
      directive.open.set(false);
    });
  }
}
