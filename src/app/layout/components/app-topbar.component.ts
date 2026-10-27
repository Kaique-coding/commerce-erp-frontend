import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/services/auth.service';
import { NotificationCenterService } from '../../core/services/notification-center.service';
import { PerfilUsuario } from '../../features/enums/perfil-usuario.enum';





@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ButtonModule, DatePipe, DialogModule, MenuModule],
  template: `
    <header class="app-topbar" role="banner">
      <div class="app-topbar__brand">
        <span class="app-topbar__title">Commerce ERP</span>
      </div>

      <nav class="app-topbar__actions" aria-label="Ações do usuário">
        <span class="app-topbar__notification-button">
          <p-button
            icon="pi pi-bell"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            aria-label="Abrir notificações"
            pTooltip="Notificações"
            tooltipPosition="bottom"
            (onClick)="abrirNotificacoes()"
          />
          @if (notificationCenter.unreadCountFor(perfilInterno) > 0) {
            <span class="app-topbar__notification-count" aria-label="Notificações não lidas">
              {{ notificationCenter.unreadCountFor(perfilInterno) > 99 ? '99+' : notificationCenter.unreadCountFor(perfilInterno) }}
            </span>
          }
        </span>
        <span class="app-topbar__user-menu">
          <p-button
            icon="pi pi-user"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            aria-label="Abrir menu do usuário"
            pTooltip="Perfil"
            tooltipPosition="bottom"
            (onClick)="userMenu.toggle($event)"
          />
          <p-menu #userMenu [model]="userMenuItems" [popup]="true" appendTo="body" />
        </span>
      </nav>
    </header>

    <p-dialog
      header="Notificações"
      [visible]="notificacoesVisiveis()"
      (visibleChange)="notificacoesVisiveis.set($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '440px', maxWidth: '94vw' }"
      styleClass="app-notifications-dialog"
    >
      <div class="app-notifications" aria-live="polite">
        @if (notificationCenter.notificationsFor(perfilInterno).length === 0) {
          <div class="app-notifications__empty">
            <i class="pi pi-bell-slash" aria-hidden="true"></i>
            <p>Nenhuma notificação por enquanto.</p>
          </div>
        } @else {
          <ul class="app-notifications__list">
            @for (notification of notificationCenter.notificationsFor(perfilInterno); track notification.id) {
              <li class="app-notifications__item" [class.app-notifications__item--unread]="!notification.read">
                <span class="app-notifications__icon" aria-hidden="true">
                  <i [class]="notification.icon"></i>
                </span>
                <div class="app-notifications__content">
                  <div class="app-notifications__heading">
                    <strong>{{ notification.title }}</strong>
                    @if (!notification.read) {
                      <span class="app-notifications__unread-dot" aria-label="Não lida"></span>
                    }
                  </div>
                  <p>{{ notification.message }}</p>
                  <time>{{ notification.createdAt | date: 'dd/MM/yyyy HH:mm' }}</time>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </p-dialog>
  `,
  styleUrl: './app-topbar.component.scss',
})
export class AppTopbarComponent {
  readonly perfilInterno = PerfilUsuario.USUARIO_INTERNO;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly notificationCenter = inject(NotificationCenterService);
  readonly notificacoesVisiveis = signal(false);
  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  abrirNotificacoes(): void {
    this.notificacoesVisiveis.set(true);
    this.notificationCenter.marcarComoLidas(this.perfilInterno);
  }

  logout(): void {
    this.authService.clearToken();
    void this.router.navigate(['/']);
  }
}
