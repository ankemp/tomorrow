import { SwUpdate } from '@angular/service-worker';
import {
  createDirectiveFactory,
  SpectatorDirective,
} from '@ngneat/spectator/vitest';
import { vi } from 'vitest';

import { Context } from '../../core/context.store';

import {
  SelectableTaskDirective,
  SelectedTasksStore,
} from './selectable-task.directive';

describe('SelectableTaskDirective', () => {
  let spectator: SpectatorDirective<SelectableTaskDirective>;
  const createDirective = createDirectiveFactory({
    directive: SelectableTaskDirective,
    providers: [
      SelectedTasksStore,
      {
        provide: Context,
        useValue: {
          canVibrate: vi.fn(() => true),
        },
      },
      { provide: SwUpdate, useValue: {} },
    ],
  });

  const mockTask: any = { id: '1', name: 'Test Task' };

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(global, 'navigator', {
      value: {
        vibrate: vi.fn(),
      },
      writable: true,
    });
    spectator = createDirective(`<div twSelectableTask [task]="task"></div>`, {
      hostProps: {
        task: mockTask,
      },
    });

    // Clear the store state before each test
    const store = spectator.inject(SelectedTasksStore);
    store.clearSelection();
  });

  afterEach(() => {
    // Clear all timers and restore real timers
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should create the directive', () => {
    expect(spectator.directive).toBeTruthy();
  });

  it('should select task on long touch if not selected', () => {
    const directive = spectator.directive;
    const store = spectator.inject(SelectedTasksStore);

    const selectTaskSpy = vi.spyOn(store, 'selectTask');

    // Simulate long press
    spectator.dispatchTouchEvent(spectator.element, 'touchstart');
    vi.advanceTimersByTime(directive.timeoutDelay);
    spectator.detectChanges();
    expect(directive.selected()).toBe(true);
    expect(selectTaskSpy).toHaveBeenCalledWith(mockTask);

    // Simulate touch end
    spectator.dispatchTouchEvent(spectator.element, 'touchend');
  });

  it('should unselect task on long touch if selected', () => {
    const directive = spectator.directive;
    const store = spectator.inject(SelectedTasksStore);

    const unselectTaskSpy = vi.spyOn(store, 'unselectTask');
    store.selectTask(mockTask);
    spectator.detectChanges();

    // Simulate long press
    spectator.dispatchTouchEvent(spectator.element, 'touchstart');
    vi.advanceTimersByTime(directive.timeoutDelay);
    spectator.detectChanges();
    expect(directive.selected()).toBe(false);
    expect(unselectTaskSpy).toHaveBeenCalledWith(mockTask);

    // Simulate touch end
    spectator.dispatchTouchEvent(spectator.element, 'touchend');
  });

  it('should call vibrate when canVibrate is true', () => {
    const directive = spectator.directive;
    const navigatorVibrateSpy = vi.spyOn(global.navigator, 'vibrate');

    // Simulate long press
    spectator.dispatchTouchEvent(spectator.element, 'touchstart');
    vi.advanceTimersByTime(directive.timeoutDelay);
    spectator.detectChanges();

    expect(navigatorVibrateSpy).toHaveBeenCalled();

    // Simulate touch end
    spectator.dispatchTouchEvent(spectator.element, 'touchend');
  });

  it('should not call vibrate when canVibrate is false', () => {
    const directive = spectator.directive;
    const navigatorVibrateSpy = vi.spyOn(global.navigator, 'vibrate');

    // Override canVibrate to return false
    const context = spectator.inject(Context);
    vi.spyOn(context, 'canVibrate').mockReturnValue(false);

    // Simulate long press
    spectator.dispatchTouchEvent(spectator.element, 'touchstart');
    vi.advanceTimersByTime(directive.timeoutDelay);
    spectator.detectChanges();

    expect(navigatorVibrateSpy).not.toHaveBeenCalled();

    // Simulate touch end
    spectator.dispatchTouchEvent(spectator.element, 'touchend');
  });

  it('should clean up on destroy', () => {
    const directive = spectator.directive;
    const store = spectator.inject(SelectedTasksStore);
    const unselectTaskSpy = vi.spyOn(store, 'unselectTask');

    directive.ngOnDestroy();
    expect(unselectTaskSpy).toHaveBeenCalledWith(mockTask);
  });

  it('should bind the selected class when selected', () => {
    const store = spectator.inject(SelectedTasksStore);

    store.selectTask(mockTask);
    spectator.detectChanges();
    expect(spectator.element.classList).toContain('selected');

    store.clearSelection();
    spectator.detectChanges();
    expect(spectator.element.classList).not.toContain('selected');
  });
});
