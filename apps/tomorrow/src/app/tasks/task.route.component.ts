import { NgIf } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import {
  TuiBreakpointService,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiIcon,
} from '@taiga-ui/core';
import { TuiActionBar, TuiItemsWithMore } from '@taiga-ui/kit';
import { map } from 'rxjs';

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

    <tui-action-bar *tuiActionBar="open()" [expanded]="!!expanded()">
      <tui-data-list role="menu">
        <tui-opt-group>
          <!-- <button role="menuitem" tuiOption type="button">
            <span>
              <tui-icon icon="@tui.pin" class="tui-space_right-3" />
              Pin
            </span>
          </button> -->
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
          *ngIf="!isMobile()"
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
        *ngIf="!isMobile()"
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
        *ngIf="!isMobile()"
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
        *ngIf="isMobile()"
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
        *ngIf="isMobile()"
        iconStart="@tui.ellipsis"
        tuiIconButton
        type="button"
        (click)="toggleExpanded()"
      >
        More
      </button>

      <button
        *ngIf="!isMobile()"
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
  readonly store = inject(SelectedTasksStore);
  readonly taskService = inject(TaskService);
  readonly open = computed(() => {
    return this.store.count() > 0;
  });
  readonly expanded = linkedSignal(() => {
    return !this.isMobile() && this.store.count() > 0;
  });

  readonly isMobile = toSignal(
    inject(TuiBreakpointService).pipe(map((size) => size === 'mobile')),
  );

  toggleExpanded() {
    this.expanded.update((expanded) => !expanded);
  }
}
