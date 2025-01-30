import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./tasks/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'category/:slug',
    loadComponent: () =>
      import('./tasks/category/category.component').then(
        (m) => m.CategoryComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/general/general.component').then(
        (m) => m.GeneralComponent,
      ),
  },
];
