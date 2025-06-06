import { NgIf } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiButton, TuiDataList, TuiDropdown, TuiIcon } from '@taiga-ui/core';
import { TuiActionBar, TuiItemsWithMore } from '@taiga-ui/kit';

import { Context } from '@tmrw/ui/core';

import { SelectedTasksStore } from './_primitives/selectable-task.directive';
import { TaskService } from './task.service';

@Component({
  selector: 'tw-task-route',
  imports: [
    NgIf,
    RouterModule,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiActionBar,
    TuiItemsWithMore,
  ],
  providers: [TaskService],
  template: `
    <router-outlet></router-outlet>

    <tui-action-bar *tuiActionBar="visible()" [expanded]="!!expanded()">
      <tui-data-list role="menu">
        <tui-opt-group>
          <button
            role="menuitem"
            tuiOption
            type="button"
            [disabled]="pinState() === 'disabled'"
            (click)="
              taskService.bulkTogglePinTasks(store.selected());
              store.clearSelection()
            "
          >
            @let pin = pinState() === 'pin';
            @let unpin = pinState() === 'unpin';
            @let icon = pin ? '@tui.pin' : unpin ? '@tui.pin-off' : '@tui.pin';
            <span>
              <tui-icon [icon]="icon" class="tui-space_right-3" />
              {{ pin ? 'Pin' : unpin ? 'Unpin' : 'Pin' }}
            </span>
          </button>
          <button role="menuitem" tuiOption type="button">
            <span>
              <tui-icon
                icon="@tui.trash-2"
                class="tui-space_right-3"
                (click)="
                  taskService.bulkDeleteTasks(store.selected());
                  store.clearSelection()
                "
              />
              Delete
            </span>
          </button>
        </tui-opt-group>
        <tui-opt-group>
          <button
            role="menuitem"
            tuiOption
            type="button"
            (click)="store.clearSelection()"
          >
            <span>
              <tui-icon icon="@tui.x" class="tui-space_right-3" />
              Clear selection
            </span>
          </button>
        </tui-opt-group>
        <!-- <tui-opt-group>
          <button role="menuitem" tuiOption type="button">
            <span>
              <tui-icon icon="@tui.star" class="tui-space_right-3" />
              Action
            </span>
          </button>
        </tui-opt-group> -->
      </tui-data-list>

      <div>
        <strong>Selected: {{ store.count() }}</strong>
        <button
          *ngIf="!context.isMobile()"
          tuiLink
          type="button"
          class="tui-space_left-3"
          (click)="store.clearSelection()"
        >
          Clear selection
        </button>
      </div>

      <!-- <tui-items-with-more>
        <button *tuiItem iconStart="@tui.star" tuiButton type="button">
          Action
        </button>
        <ng-template let-lastIndex tuiMore>
          <button
            iconStart="@tui.ellipsis"
            tuiButton
            tuiDropdownAlign="right"
            tuiDropdownOpen
            type="button"
            [tuiDropdown]="dropdown"
          >
            More
          </button>
          <ng-template #dropdown>
            <tui-data-list size="l">
              <button tuiOption type="button">Action</button>
            </tui-data-list>
          </ng-template>
        </ng-template>
      </tui-items-with-more> -->

      <button
        *ngIf="!context.isMobile()"
        iconStart="@tui.check-check"
        tuiButton
        type="button"
        (click)="
          taskService.bulkCompleteTasks(store.selected());
          store.clearSelection()
        "
      >
        Complete All
      </button>
      <button
        *ngIf="!context.isMobile()"
        iconStart="@tui.trash-2"
        tuiButton
        type="button"
        (click)="
          taskService.bulkDeleteTasks(store.selected()); store.clearSelection()
        "
      >
        Delete
      </button>

      <button
        *ngIf="context.isMobile()"
        iconStart="@tui.check-check"
        tuiIconButton
        type="button"
        (click)="
          taskService.bulkCompleteTasks(store.selected());
          store.clearSelection()
        "
      >
        Complete All
      </button>
      <button
        *ngIf="context.isMobile()"
        iconStart="@tui.ellipsis"
        tuiIconButton
        type="button"
        (click)="toggleExpanded()"
      >
        More
      </button>

      <button
        *ngIf="!context.isMobile()"
        appearance="icon"
        iconStart="@tui.x"
        tuiIconButton
        type="button"
        (click)="store.clearSelection()"
      >
        Close
      </button>
    </tui-action-bar>
  `,
})
export class TaskRouteComponent {
  readonly context = inject(Context);
  readonly store = inject(SelectedTasksStore);
  readonly taskService = inject(TaskService);
  readonly visible = computed(() => {
    return this.store.count() > 0;
  });
  readonly expanded = linkedSignal(() => {
    return !this.context.isMobile() && this.visible();
  });
  readonly pinState = computed(() => {
    const selectedTasks = this.store.selected();
    if (selectedTasks.length === 0) {
      return 'disabled';
    }

    const allPinned = selectedTasks.every((task) => task.pinned);
    const allUnpinned = selectedTasks.every((task) => !task.pinned);

    if (allPinned) {
      return 'unpin';
    } else if (allUnpinned) {
      return 'pin';
    } else {
      return 'disabled';
    }
  });

  toggleExpanded() {
    this.expanded.update((expanded) => !expanded);
  }
}
