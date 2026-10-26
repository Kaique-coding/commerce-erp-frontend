import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppSidebarComponent } from './app-sidebar.component';
import { AppTopbarComponent } from './app-topbar.component';

/**
 * Layout principal da aplicação.
 *
 * Registra os componentes globais do PrimeNG:
 *   - <p-toast>: necessário para NotificationService.success/error/warn/info
 *   - <p-confirmDialog>: necessário para NotificationService.confirm
 *
 * Toda nova página deve ser carregada via <router-outlet> dentro deste layout.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    ConfirmDialogModule,
    AppSidebarComponent,
    AppTopbarComponent,
  ],
  template: `
    <div class="app-layout">
      <app-sidebar />

      <div class="app-layout__main">
        <app-topbar />

        <main class="app-layout__content" role="main">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Componentes globais do PrimeNG — necessários apenas uma vez no layout -->
    <p-toast position="top-right" />
    <p-confirmDialog />
  `,
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {}
