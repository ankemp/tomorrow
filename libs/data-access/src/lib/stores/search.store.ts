import { computed, effect } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { Tasks } from '../collections/task.collection';
import { SearchState } from '../models/search.state';

const initialState: SearchState = {
  isOpen: false,
  resent: [],
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
    resentMax: computed(() => {
      return state.resent().slice(0, 5);
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
      const resent = store.resent();
      const lowerCaseQuery = query.toLowerCase();
      const filteredResent = resent.filter(
        (r) => r.toLowerCase() !== lowerCaseQuery,
      );
      patchState(store, { query, resent: [query, ...filteredResent] });
    },
    setFromRecent(query: string) {
      patchState(store, { query });
    },
    removeRecent(query: string) {
      patchState(store, { resent: store.resent().filter((r) => r !== query) });
    },
  })),
  withHooks({
    onInit(store) {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const search = localStorage.getItem('search');
        if (search) {
          patchState(store, JSON.parse(search));
        }
        effect(() => {
          const resent = store.resent();
          localStorage.setItem('search', JSON.stringify({ resent }));
        });
      }
    },
  }),
);
