import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'tasks/dashboard', pathMatch: 'full' },
  {
    path: 'tasks',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
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
        path: 'completed',
        loadComponent: () =>
          import('./tasks/completed/completed.component').then(
            (m) => m.CompletedComponent,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./tasks/create/create.component').then(
            (m) => m.CreateComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./tasks/task/task.component').then((m) => m.TaskComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./tasks/edit/edit.component').then((m) => m.EditComponent),
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
  {
    path: 'settings/connect-device',
    loadComponent: () =>
      import('./settings/connect-device/connect-device.component').then(
        (m) => m.ConnectDeviceComponent,
      ),
  },
];
