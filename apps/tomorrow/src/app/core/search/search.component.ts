import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TuiSheetDialog } from '@taiga-ui/addon-mobile';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import {
  TuiAppearance,
  TuiAutoColorPipe,
  TuiButton,
  TuiDropdown,
  TuiIcon,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiChip, TuiFade } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockStatus, TuiCell } from '@taiga-ui/layout';
import { debounceTime, filter } from 'rxjs';

import { Search } from '@tmrw/data-access';

import { FormatDatePipe } from '../../tasks/_primitives/format-date/format-date.pipe';

@Component({
  selector: 'tw-search',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TuiSheetDialog,
    TuiAutoFocus,
    TuiAppearance,
    TuiAutoColorPipe,
    TuiButton,
    TuiDropdown,
    TuiIcon,
    TuiTitle,
    TuiChip,
    TuiFade,
    TuiAppBar,
    TuiBlockStatus,
    TuiCell,
    FormatDatePipe,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  private readonly router = inject(Router);
  readonly search = inject(Search);
  readonly searchInput = new FormControl();

  results = computed(() => {
    if (!this.search.query()) {
      return [];
    }
    return this.search.cursor().fetch();
  });
  count = computed(() => {
    if (!this.search.query()) {
      return 0;
    }
    return this.search.cursor().count();
  });

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(
        filter((value) => value.length > 0),
        debounceTime(300),
      )
      .subscribe((value) => {
        this.search.setQuery(value);
      });
  }

  setFromRecent(query: string) {
    this.searchInput.setValue(query, { emitEvent: false });
    this.search.setFromRecent(query);
  }

  goToTask(id: string) {
    this.search.close();
    this.router.navigate(['tasks', id]);
  }
}
