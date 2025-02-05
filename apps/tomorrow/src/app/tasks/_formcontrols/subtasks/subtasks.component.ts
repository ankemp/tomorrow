import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { TuiButton, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiGroup } from '@taiga-ui/core';
import { map } from 'rxjs';

@Component({
  selector: 'tw-subtasks',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubtasksComponent implements ControlValueAccessor {
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    tasks: this.fb.array([this.fb.control<string>('')]),
  });

  get formArray() {
    return this.form.get('tasks') as FormArray<FormControl<string>>;
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

  writeValue(input: string[]): void {
    if (input.length > 0) {
      input.forEach((item) => {
        this.formArray.push(this.fb.control<string>(item));
      });
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

  addTask() {
    this.formArray.push(this.fb.control<string>(''));
  }

  removeTask(index: number) {
    this.formArray.removeAt(index);
  }
}
