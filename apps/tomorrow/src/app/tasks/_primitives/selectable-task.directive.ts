import {
  computed,
  Directive,
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

  readonly timeoutDelay = 500;
  private longPressTimeout?: NodeJS.Timeout;

  private startX = 0;
  private startY = 0;
  private readonly scrollThreshold = 10;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.longPressTimeout = setTimeout(() => {
      this.onLongPress();
    }, this.timeoutDelay);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - this.startX);
    const deltaY = Math.abs(touch.clientY - this.startY);

    if (deltaX > this.scrollThreshold || deltaY > this.scrollThreshold) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = undefined;
    }
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
