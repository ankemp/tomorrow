import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'tasks/dashboard', pathMatch: 'full' },
  {
    path: 'tasks',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
      },
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
        path: ':id',
        loadComponent: () =>
          import('./tasks/task/task.component').then((m) => m.TaskComponent),
      },
    ],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/general/general.component').then(
        (m) => m.GeneralComponent,
      ),
  },
  {
    path: 'settings/add-device',
    loadComponent: () =>
      import('./settings/add-device/add-device.component').then(
        (m) => m.AddDeviceComponent,
      ),
  },
];
