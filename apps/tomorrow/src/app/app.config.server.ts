import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { UNIVERSAL_PROVIDERS } from '@ng-web-apis/universal';

import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

import 'fake-indexeddb/auto';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    UNIVERSAL_PROVIDERS,
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
