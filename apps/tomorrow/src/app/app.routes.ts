import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'tasks/dashboard', pathMatch: 'full' },
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/task.routes'),
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
