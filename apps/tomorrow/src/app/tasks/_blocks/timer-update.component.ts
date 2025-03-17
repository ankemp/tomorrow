import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiSheetDialogOptions } from '@taiga-ui/addon-mobile';
import { TuiPopover } from '@taiga-ui/cdk';
import { TuiButton, TuiLabel } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { Task, TaskTimer } from '@tmrw/data-access';

import { DatePickerComponent } from '../_formcontrols/date-picker/date-picker.component';

@Component({
  selector: 'tw-timer-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiLabel,
    DatePickerComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label tuiLabel>
        Start
        <tw-date-picker
          formControlName="start"
          [showPresets]="false"
          specificityOverride="always"
        />
      </label>
      <label tuiLabel>
        End
        <tw-date-picker
          formControlName="end"
          [showPresets]="false"
          specificityOverride="always"
        />
      </label>
      <button tuiButton type="submit">Update</button>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
    form {
      display: grid;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerUpdateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly context =
    injectContext<
      TuiPopover<
        TuiSheetDialogOptions<{ task: Task; timerIndex: number }>,
        TaskTimer
      >
    >();
  readonly form = this.fb.group({
    start: this.fb.control<Date>(new Date(), [Validators.required]),
    end: this.fb.control<Date>(new Date(), [Validators.required]),
  });

  ngOnInit(): void {
    const task = this.context.data.task;
    const timer = task.timers.at(this.context.data.timerIndex);
    if (timer) {
      this.form.patchValue({
        start: timer.start,
        end: timer.end,
      });
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.context.completeWith({
        start: this.form.value.start!,
        end: this.form.value.end!,
      });
    }
  }
}
