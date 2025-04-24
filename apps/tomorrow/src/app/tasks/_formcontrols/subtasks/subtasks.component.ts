import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { TuiAutoFocus, tuiAutoFocusOptionsProvider } from '@taiga-ui/cdk';
import { TuiButton, TuiGroup, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { map } from 'rxjs';

import { SubTask } from '@tmrw/data-access-models';

@Component({
  selector: 'tw-subtasks',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiAutoFocus,
    TuiButton,
    TuiLabel,
    TuiTextfield,
    TuiGroup,
  ],
  templateUrl: './subtasks.component.html',
  styleUrl: './subtasks.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SubtasksComponent),
      multi: true,
    },
    tuiAutoFocusOptionsProvider({
      delay: 100,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubtasksComponent implements ControlValueAccessor {
  private fb = inject(NonNullableFormBuilder);

  readonly createOnly = input(true);

  readonly form = this.fb.group({
    tasks: this.fb.array<
      FormGroup<{
        title: FormControl<string>;
        completedAt: FormControl<Date | null>;
      }>
    >([]),
  });

  get formArray() {
    return this.form.get('tasks') as FormArray<FormGroup>;
  }

  constructor() {
    this.form.valueChanges
      .pipe(
        takeUntilDestroyed(),
        map((form) => form.tasks),
      )
      .subscribe((tasks) => {
        this._onChange(tasks);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  writeValue(input: SubTask[] | null): void {
    if (input && input.length > 0) {
      input.forEach((item) => {
        this.formArray.push(this.newTask(item.title, item.completedAt));
      });
      this.formArray.push(this.newTask());
    } else {
      this.form.setControl('tasks', this.fb.array([this.newTask()]));
    }
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  private newTask(task = '', completedAt: Date | null = null) {
    return this.fb.group({
      title: this.fb.control<string>(task),
      completedAt: this.fb.control<Date | null>(completedAt),
    });
  }

  addTask() {
    this.formArray.push(this.newTask());
  }

  removeTask(index: number) {
    this.formArray.removeAt(index);
  }
}
