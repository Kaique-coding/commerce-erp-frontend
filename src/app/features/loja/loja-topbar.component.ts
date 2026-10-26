import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../core/services/auth.service';
import { NotificationCenterService } from '../../core/services/notification-center.service';
import { PerfilUsuario } from '../enums/perfil-usuario.enum';

/** Topbar da loja com as ações de notificação e encerramento de sessão existentes. */
@Component({
  selector: 'app-loja-topbar',
  standalone: true,
  imports: [ButtonModule, DatePipe, DialogModule, MenuModule],
  template: `
      <header class="loja-topbar" role="banner">
      <div class="loja-topbar__brand">
        <span class="loja-topbar__title">Commerce ERP</span>
      </div>

      <nav class="loja-topbar__actions" aria-label="Ações do cliente">
        <span class="loja-topbar__notification-button">
          <p-button
            icon="pi pi-bell"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            aria-label="Abrir notificações"
            (onClick)="abrirNotificacoes()"
          />
          @if (notificationCenter.unreadCountFor(perfilCliente) > 0) {
            <span class="loja-topbar__notification-count" aria-label="Notificações não lidas">
              {{ notificationCenter.unreadCountFor(perfilCliente) > 99 ? '99+' : notificationCenter.unreadCountFor(perfilCliente) }}
            </span>
          }
        </span>

        <span class="loja-topbar__user-menu">
          <p-button
            icon="pi pi-user"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            aria-label="Abrir menu do usuário"
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
    >
      @if (notificationCenter.notificationsFor(perfilCliente).length === 0) {
        <div class="loja-notifications__empty">
          <i class="pi pi-bell-slash" aria-hidden="true"></i>
          <p>Nenhuma notificação por enquanto.</p>
        </div>
      } @else {
        <ul class="loja-notifications__list" aria-live="polite">
          @for (notification of notificationCenter.notificationsFor(perfilCliente); track notification.id) {
            <li class="loja-notifications__item">
              <span class="loja-notifications__icon" aria-hidden="true">
                <i [class]="notification.icon"></i>
              </span>
              <div class="loja-notifications__content">
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.message }}</p>
                <time>{{ notification.createdAt | date: 'dd/MM/yyyy HH:mm' }}</time>
              </div>
            </li>
          }
        </ul>
      }
    </p-dialog>
  `,
  styleUrl: './loja-topbar.component.scss',
})
export class LojaTopbarComponent {
  readonly perfilCliente = PerfilUsuario.CLIENTE;
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
    this.notificationCenter.marcarComoLidas(this.perfilCliente);
  }

  logout(): void {
    this.authService.clearToken();
    void this.router.navigate(['/']);
  }
}
