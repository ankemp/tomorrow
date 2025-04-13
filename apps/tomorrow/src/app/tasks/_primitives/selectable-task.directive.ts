import {
  computed,
  Directive,
  effect,
  HostBinding,
  HostListener,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { Task } from '@tmrw/data-access';

interface SelectedTaskState {
  selected: Task[];
}
const initialState: SelectedTaskState = {
  selected: [],
};

export const SelectedTasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    selectTask(task: Task): void {
      patchState(store, (state) => ({
        selected: [...state.selected, task],
      }));
    },
    unselectTask(task: Task): void {
      patchState(store, (state) => ({
        selected: state.selected.filter(({ id }) => id !== task.id),
      }));
    },
    clearSelection(): void {
      patchState(store, () => ({
        selected: [],
      }));
    },
  })),
  withComputed((state) => ({
    count: computed(() => {
      return state.selected().length;
    }),
    selectedIds: computed(() => {
      return state.selected().map(({ id }) => id);
    }),
  })),
);

@Directive({
  selector: '[twSelectableTask]',
  host: {
    '[class.selected]': 'selected()',
    '[attr.aria-selected]': 'selected()',
  },
})
export class SelectableTaskDirective implements OnDestroy {
  private readonly store = inject(SelectedTasksStore);
  readonly task = input.required<Task>();
  readonly selected = computed(() => {
    return this.store.selectedIds().includes(this.task().id);
  });

  private longPressTimeout?: NodeJS.Timeout;
  readonly timeoutDelay = 500;

  @HostListener('touchstart')
  onTouchStart(): void {
    this.longPressTimeout = setTimeout(() => {
      this.onLongPress();
    }, this.timeoutDelay);
  }

  @HostListener('touchend')
  @HostListener('touchcancel')
  onTouchEnd(): void {
    clearTimeout(this.longPressTimeout);
    this.longPressTimeout = undefined;
  }

  private onLongPress(): void {
    if (this.selected()) {
      this.store.unselectTask(this.task());
    } else {
      this.store.selectTask(this.task());
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.longPressTimeout);
    this.longPressTimeout = undefined;
    this.store.unselectTask(this.task());
  }
}
