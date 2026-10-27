import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppSidebarComponent } from './app-sidebar.component';
import { AppTopbarComponent } from './app-topbar.component';










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


    <p-toast position="top-right" />
    <p-confirmDialog />
  `,
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {}
