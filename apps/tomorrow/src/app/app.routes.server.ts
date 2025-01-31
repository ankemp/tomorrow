import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  // {
  //   path: 'dashboard',
  //   renderMode: RenderMode.Client,
  // },
  // {
  //   path: 'category/*',
  //   renderMode: RenderMode.Client,
  // },
  {
    path: '**', // All other routes will be rendered on the server (SSR)
    renderMode: RenderMode.Server,
  },
];
