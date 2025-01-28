import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./tasks/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
];
