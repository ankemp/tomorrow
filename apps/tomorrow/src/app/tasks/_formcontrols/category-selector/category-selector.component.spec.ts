import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { describe, expect, it, vi } from 'vitest';

import { Settings } from '@tmrw/data-access';

import { CategorySelectorComponent } from './category-selector.component';

describe('CategorySelectorComponent', () => {
  let spectator: Spectator<CategorySelectorComponent>;

  // Mock Settings class
  class MockSettings {
    defaultReminderCategory = vi.fn(() => 'Default Category');
  }

  const createComponent = createComponentFactory({
    component: CategorySelectorComponent,
    providers: [{ provide: Settings, useClass: MockSettings }],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create the component', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should set the category when writeValue is called with a value', () => {
    const testCategory = 'Test Category';
    spectator.component.writeValue(testCategory);
    expect(spectator.component.category()).toBe(testCategory);
  });

  it('should set the default category when writeValue is called with null', () => {
    spectator.component.writeValue(null);
    expect(spectator.component.category()).toBe('Default Category');
  });

  it('should call _onChange when the category changes', () => {
    const testCategory = 'New Category';
    const onChangeSpy = vi.fn();
    spectator.component.registerOnChange(onChangeSpy);

    spectator.component.category.set(testCategory);
    spectator.detectChanges();
    expect(onChangeSpy).toHaveBeenCalledWith(testCategory);
  });

  it('should set disabled state correctly', () => {
    spectator.component.setDisabledState(true);
    expect(spectator.component.disabled()).toBe(true);

    spectator.component.setDisabledState(false);
    expect(spectator.component.disabled()).toBe(false);
  });
});
