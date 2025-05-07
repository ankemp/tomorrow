import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { TuiFiles } from '@taiga-ui/kit';

@Component({
  selector: 'tw-file-upload',
  imports: [CommonModule, FormsModule, TuiFiles],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements ControlValueAccessor {
  readonly accept = input('*/*');
  readonly maxFileSize = input();
  readonly files = signal<File[]>([]);
  readonly disabled = signal(false);

  readonly hasFiles = computed(() => {
    return this.files().length > 0;
  });

  /* eslint-disable @typescript-eslint/no-empty-function */
  private _onChange = (_: any) => {};
  private _onTouched = (_: any) => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor() {
    effect(() => {
      this._onChange(this.files());
      this._onTouched(this.files());
    });
  }

  writeValue(input: File[]): void {
    this.files.set(input);
  }
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: (_: any) => void): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onRemove(file: File) {
    this.files.update((files) => files.filter((f) => f !== file));
  }
}
