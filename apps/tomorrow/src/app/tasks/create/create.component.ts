import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiAppearance,
  TuiButton,
  TuiLabel,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiAccordion } from '@taiga-ui/experimental';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { TuiTextareaModule } from '@taiga-ui/legacy';
import { dir, write } from 'opfs-tools';

import { Settings, SubTask, Tasks } from '@tmrw/data-access';

import { CategorySelectorComponent } from '../_formcontrols/category-selector/category-selector.component';
import { DatePickerComponent } from '../_formcontrols/date-picker/date-picker.component';
import { DurationComponent } from '../_formcontrols/duration/duration.component';
import { FileUploadComponent } from '../_formcontrols/file-upload/file-upload.component';
import { SubtasksComponent } from '../_formcontrols/subtasks/subtasks.component';

@Component({
  selector: 'tw-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    DatePickerComponent,
    CategorySelectorComponent,
    SubtasksComponent,
    DurationComponent,
    FileUploadComponent,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  private readonly alerts = inject(TuiAlertService);
  settings = inject(Settings);
  form = this.fb.group({
    userId: this.fb.control<string>(''),
    title: this.fb.control<string>('', [Validators.required]),
    date: this.fb.control<Date | null>(null, [Validators.required]),
    category: this.fb.control<string>('', [Validators.required]),
    location: this.fb.control<string>(''),
    duration: this.fb.control<number>(0),
    subTasks: this.fb.control<SubTask[]>([]),
    attachments: this.fb.control<File[]>([]),
    notes: this.fb.control<string | null>(null),
  });

  constructor() {
    effect(() => {
      const userId = this.settings.userId();
      this.form.get('userId')?.setValue(userId);
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.form.valid) {
      const { attachments, ...formData } = this.form.value;
      const id = Tasks.insert(formData);
      if (attachments && attachments.length > 0) {
        await dir(`/files/${id}`).create();
        await Promise.all(
          attachments.map((file) =>
            write(`/files/${id}/${file.name}`, file.stream()),
          ),
        );
        Tasks.updateOne(
          { id },
          { $set: { attachments: attachments.map((file) => file.name) } },
        );
      }

      this.form.reset({
        title: '',
        date: null,
        category: '',
        location: '',
        duration: 0,
        subTasks: [], // reset subTasks to an empty array
        attachments: [],
        notes: '',
      });
      this.alerts.open('Task created').subscribe();
    } else {
      // TODO: Handle invalid form, show invalid fields
      this.alerts
        .open('Invalid form', { appearance: 'primary-destructive' })
        .subscribe();
    }
  }
}
