import { Route } from '@angular/router';

export default [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'category/:slug',
    loadComponent: () =>
      import('./category/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'completed',
    loadComponent: () =>
      import('./completed/completed.component').then(
        (m) => m.CompletedComponent,
      ),
  },
  {
    path: 'upcoming',
    loadComponent: () =>
      import('./upcoming/upcoming.component').then((m) => m.UpcomingComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./create/create.component').then((m) => m.CreateComponent),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./task/task.component').then((m) => m.TaskComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./edit/edit.component').then((m) => m.EditComponent),
  },
  {
    path: '**',
    redirectTo: '404',
  },
] satisfies Route[];
