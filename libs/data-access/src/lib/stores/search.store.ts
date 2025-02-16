import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { Tasks } from '../collections/task.collection';
import { SearchState } from '../models/search.state';

const initialState: SearchState = {
  isOpen: false,
  query: '',
};

export const Search = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    loading: computed(() => {
      if (state.isOpen()) {
        return Tasks.isLoading();
      }
      return false;
    }),
    cursor: computed(() => {
      const query = state.query();
      return Tasks.searchTasks(query);
    }),
  })),
  withMethods((store) => ({
    open() {
      patchState(store, { isOpen: true, query: '' });
    },
    close() {
      patchState(store, { isOpen: false, query: '' });
    },
    toggle() {
      patchState(store, { isOpen: !store.isOpen(), query: '' });
    },
    setIsOpen(isOpen: boolean) {
      patchState(store, { isOpen, query: '' });
    },
    setQuery(query: string) {
      patchState(store, { query });
    },
  })),
);
