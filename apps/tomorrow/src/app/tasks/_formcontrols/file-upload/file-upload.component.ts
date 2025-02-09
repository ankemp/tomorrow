import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
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
  readonly files = model<File[]>([]);

  readonly hasFiles = computed(() => {
    return this.files().length > 0;
  });

  readonly disabled = signal(false);

  constructor() {
    effect(() => {
      this._onChange(this.files());
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onChange = (_: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  writeValue(input: File[]): void {
    this.files.set(input);
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onRemove(file: File) {
    this.files.update((files) => files.filter((f) => f !== file));
  }
}
