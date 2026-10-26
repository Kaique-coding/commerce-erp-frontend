import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { primeNGConfig } from './core/theme.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Animações assíncronas — requerido pelo PrimeNG v19+
    provideAnimationsAsync(),

    // HttpClient com interceptor de autenticação (injeta Bearer token)
    provideHttpClient(withInterceptors([authInterceptor])),

    // Configuração global do PrimeNG com preset Aura personalizado
    providePrimeNG(primeNGConfig),

    // ngx-mask disponível em toda a aplicação
    provideNgxMask(),

    // Serviços globais do PrimeNG utilizados pelo NotificationService
    // Precisam estar registrados globalmente (não providedIn: 'root') para
    // que o Toast e ConfirmDialog do layout os consumam corretamente.
    MessageService,
    ConfirmationService,
  ],
};
